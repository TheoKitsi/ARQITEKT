import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../models/probing.dart';
import '../../services/api_client.dart';
import '../../providers/pipeline_provider.dart';
import '../../theme/tokens.dart';

/// Agent badge color palette, matching the Hub ProbingDialog.
Color _agentColor(String agentType) => switch (agentType) {
      'socratic' => Tokens.accent, // blue
      'devils_advocate' => Tokens.red,
      'constraint' => Tokens.orange,
      'example' => Tokens.green,
      'boundary' => Tokens.gold,
      _ => Tokens.textSecondary,
    };

String _agentLabel(String agentType) => switch (agentType) {
      'socratic' => 'Socratic',
      'devils_advocate' => "Devil's Advocate",
      'constraint' => 'Constraint',
      'example' => 'Example',
      'boundary' => 'Boundary',
      _ => agentType,
    };

/// Opens the probing bottom sheet for a given project/artifact.
Future<void> showProbingSheet(
  BuildContext context, {
  required String projectId,
  required String artifactId,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Tokens.surfaceBg2,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(Tokens.radiusLg)),
    ),
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (ctx, scrollController) => _ProbingSheet(
        projectId: projectId,
        artifactId: artifactId,
        scrollController: scrollController,
      ),
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Probing Sheet (stateful, manages the probing session lifecycle)
// ─────────────────────────────────────────────────────────────────────

class _ProbingSheet extends ConsumerStatefulWidget {
  final String projectId;
  final String artifactId;
  final ScrollController scrollController;

  const _ProbingSheet({
    required this.projectId,
    required this.artifactId,
    required this.scrollController,
  });

  @override
  ConsumerState<_ProbingSheet> createState() => _ProbingSheetState();
}

enum _SheetPhase { idle, analyzing, active, completed }

class _ProbingSheetState extends ConsumerState<_ProbingSheet> {
  _SheetPhase _phase = _SheetPhase.idle;
  ProbingSession? _session;
  String? _error;
  String? _selectedOptionId;
  final _skipReasonController = TextEditingController();
  bool _submitting = false;

  ApiClient get _api => ref.read(apiClientProvider);

  @override
  void dispose() {
    _skipReasonController.dispose();
    super.dispose();
  }

  // ── Start probing session ──────────────────────────────────────────
  Future<void> _startProbing() async {
    setState(() {
      _phase = _SheetPhase.analyzing;
      _error = null;
    });
    try {
      await _api.startProbing(widget.projectId, artifactId: widget.artifactId);
      await _refreshSession();
      setState(() => _phase = _session != null && _session!.openQuestions.isNotEmpty
          ? _SheetPhase.active
          : _SheetPhase.completed);
    } catch (e) {
      setState(() {
        _phase = _SheetPhase.idle;
        _error = '$e';
      });
    }
  }

  Future<void> _refreshSession() async {
    final data = await _api.getProbingQuestions(
      widget.projectId,
      artifactId: widget.artifactId,
    );
    setState(() => _session = ProbingSession.fromJson(data));
    if (_session!.completed) {
      setState(() => _phase = _SheetPhase.completed);
    }
  }

  // ── Answer a question ──────────────────────────────────────────────
  Future<void> _answer(ProbingQuestion q) async {
    if (_selectedOptionId == null) return;
    setState(() => _submitting = true);
    try {
      await _api.answerProbingQuestion(
        widget.projectId,
        artifactId: widget.artifactId,
        questionId: q.id,
        answer: _selectedOptionId!,
      );
      _selectedOptionId = null;
      await _refreshSession();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  // ── Skip a question ────────────────────────────────────────────────
  Future<void> _skip(ProbingQuestion q) async {
    final reason = _skipReasonController.text.trim();
    if (reason.isEmpty) return;
    setState(() => _submitting = true);
    try {
      await _api.skipProbingQuestion(
        widget.projectId,
        artifactId: widget.artifactId,
        questionId: q.id,
        reason: reason,
      );
      _skipReasonController.clear();
      await _refreshSession();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  // ── Build ──────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: widget.scrollController,
      padding: const EdgeInsets.symmetric(horizontal: Tokens.space4, vertical: Tokens.space3),
      children: [
        // Handle
        Center(
          child: Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: Tokens.space3),
            decoration: BoxDecoration(
              color: Tokens.surfaceBg4,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),

        // Title
        Row(
          children: [
            Icon(LucideIcons.messageCircle, color: Tokens.gold, size: 20),
            const SizedBox(width: Tokens.space2),
            Expanded(
              child: Text(
                AppLocalizations.of(context)!.probingTitle(widget.artifactId),
                style: const TextStyle(
                  fontSize: Tokens.fontLg,
                  fontWeight: FontWeight.w700,
                  color: Tokens.textPrimary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: Tokens.space4),

        // Body depends on phase
        if (_error != null) _buildError(),
        ..._buildPhase(),
      ],
    );
  }

  Widget _buildError() {
    return Card(
      color: Tokens.red.withValues(alpha: 0.1),
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space3),
        child: Row(
          children: [
            const Icon(LucideIcons.alertTriangle, color: Tokens.red, size: 16),
            const SizedBox(width: Tokens.space2),
            Expanded(
              child: Text('$_error',
                  style: const TextStyle(color: Tokens.red, fontSize: Tokens.fontSm)),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildPhase() {
    return switch (_phase) {
      _SheetPhase.idle => _buildIdle(),
      _SheetPhase.analyzing => _buildAnalyzing(),
      _SheetPhase.active => _buildActive(),
      _SheetPhase.completed => _buildCompleted(),
    };
  }

  // ── Idle: Ready to start ───────────────────────────────────────────
  List<Widget> _buildIdle() {
    return [
      const Text(
        'Run the probing agents to identify gaps and improve this artifact\'s quality.',
        style: TextStyle(color: Tokens.textSecondary, fontSize: Tokens.fontSm),
      ),
      const SizedBox(height: Tokens.space4),
      FilledButton.icon(
        onPressed: _startProbing,
        icon: const Icon(LucideIcons.play),
        label: Text(AppLocalizations.of(context)!.startProbing),
        style: FilledButton.styleFrom(
          backgroundColor: Tokens.gold,
          foregroundColor: Colors.black,
        ),
      ),
    ];
  }

  // ── Analyzing ──────────────────────────────────────────────────────
  List<Widget> _buildAnalyzing() {
    return [
      const SizedBox(height: Tokens.space6),
      const Center(child: CircularProgressIndicator(color: Tokens.gold)),
      const SizedBox(height: Tokens.space3),
      Center(
        child: Text(
          AppLocalizations.of(context)!.analyzingGaps,
          style: TextStyle(color: Tokens.textSecondary, fontSize: Tokens.fontSm),
        ),
      ),
    ];
  }

  // ── Active: Show current question ──────────────────────────────────
  List<Widget> _buildActive() {
    if (_session == null) return [];
    final open = _session!.openQuestions;
    if (open.isEmpty) return _buildCompleted();
    final q = open.first;
    final progress = _session!.total > 0
        ? (_session!.answered + _session!.skipped) / _session!.total
        : 0.0;

    return [
      // Progress bar
      _ProgressIndicator(
        progress: progress,
        answered: _session!.answered,
        skipped: _session!.skipped,
        total: _session!.total,
      ),
      const SizedBox(height: Tokens.space4),

      // Agent badge
      _AgentBadge(agentType: q.agentType),
      const SizedBox(height: Tokens.space3),

      // Question
      Text(
        q.question,
        style: const TextStyle(
          fontSize: Tokens.fontBase,
          fontWeight: FontWeight.w600,
          color: Tokens.textPrimary,
          height: 1.5,
        ),
      ),
      const SizedBox(height: Tokens.space3),

      // Why important (collapsible)
      if (q.whyImportant.isNotEmpty) ...[
        ExpansionTile(
          tilePadding: EdgeInsets.zero,
          title: Text(
            'Why is this important?',
            style: TextStyle(
              fontSize: Tokens.fontSm,
              color: Tokens.gold,
              fontWeight: FontWeight.w600,
            ),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: Tokens.space2),
              child: Text(
                q.whyImportant,
                style: const TextStyle(
                  fontSize: Tokens.fontSm,
                  color: Tokens.textSecondary,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: Tokens.space2),
      ],

      // Options
      ...q.options.map((opt) => Padding(
            padding: const EdgeInsets.only(bottom: Tokens.space2),
            child: _OptionTile(
              option: opt,
              selected: _selectedOptionId == opt.id,
              onTap: () => setState(() => _selectedOptionId = opt.id),
            ),
          )),
      const SizedBox(height: Tokens.space3),

      // Submit button
      FilledButton(
        onPressed: _submitting || _selectedOptionId == null ? null : () => _answer(q),
        style: FilledButton.styleFrom(
          backgroundColor: Tokens.gold,
          foregroundColor: Colors.black,
        ),
        child: _submitting
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
              )
            : Text(AppLocalizations.of(context)!.submitAnswer),
      ),

      // Skip
      if (q.canSkip) ...[
        const SizedBox(height: Tokens.space3),
        TextField(
          controller: _skipReasonController,
          decoration: InputDecoration(
            hintText: AppLocalizations.of(context)!.skipReasonHint,
            hintStyle: const TextStyle(color: Tokens.textTertiary),
            filled: true,
            fillColor: Tokens.surfaceBg3,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(Tokens.radiusSm),
              borderSide: BorderSide.none,
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: Tokens.space3, vertical: Tokens.space2),
          ),
          style: const TextStyle(fontSize: Tokens.fontSm, color: Tokens.textPrimary),
        ),
        const SizedBox(height: Tokens.space2),
        OutlinedButton(
          onPressed: _submitting ? null : () => _skip(q),
          style: OutlinedButton.styleFrom(foregroundColor: Tokens.textSecondary),
          child: Text(AppLocalizations.of(context)!.skip),
        ),
      ],
    ];
  }

  // ── Completed ──────────────────────────────────────────────────────
  List<Widget> _buildCompleted() {
    return [
      const SizedBox(height: Tokens.space4),
      Center(
        child: Icon(LucideIcons.checkCircle2, size: 48, color: Tokens.green),
      ),
      const SizedBox(height: Tokens.space3),
      Center(
        child: Text(
          AppLocalizations.of(context)!.probingComplete,
          style: TextStyle(
            fontSize: Tokens.fontLg,
            fontWeight: FontWeight.w700,
            color: Tokens.textPrimary,
          ),
        ),
      ),
      if (_session != null) ...[
        const SizedBox(height: Tokens.space2),
        Center(
          child: Text(
            AppLocalizations.of(context)!.probingSummary(_session!.answered, _session!.skipped, _session!.total),
            style: const TextStyle(color: Tokens.textSecondary, fontSize: Tokens.fontSm),
          ),
        ),
      ],
      const SizedBox(height: Tokens.space4),
      FilledButton(
        onPressed: () {
          ref.invalidate(pipelineProvider(widget.projectId));
          ref.invalidate(confidenceProvider(widget.projectId));
          Navigator.of(context).pop();
        },
        style: FilledButton.styleFrom(
          backgroundColor: Tokens.gold,
          foregroundColor: Colors.black,
        ),
        child: Text(AppLocalizations.of(context)!.done),
      ),
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Small helper widgets
// ─────────────────────────────────────────────────────────────────────

class _AgentBadge extends StatelessWidget {
  final String agentType;
  const _AgentBadge({required this.agentType});

  @override
  Widget build(BuildContext context) {
    final color = _agentColor(agentType);
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: Tokens.space2, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(Tokens.radiusSm),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Text(
            _agentLabel(agentType),
            style: TextStyle(
              fontSize: Tokens.fontXs,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}

class _OptionTile extends StatelessWidget {
  final ProbingOption option;
  final bool selected;
  final VoidCallback onTap;

  const _OptionTile({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(Tokens.space3),
        decoration: BoxDecoration(
          color: selected ? Tokens.gold.withValues(alpha: 0.1) : Tokens.surfaceBg3,
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
          border: Border.all(
            color: selected ? Tokens.gold : Tokens.borderDefault,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              option.label,
              style: TextStyle(
                fontSize: Tokens.fontSm,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                color: Tokens.textPrimary,
              ),
            ),
            if (option.impact.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                option.impact,
                style: const TextStyle(fontSize: Tokens.fontXs, color: Tokens.textTertiary),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProgressIndicator extends StatelessWidget {
  final double progress;
  final int answered;
  final int skipped;
  final int total;

  const _ProgressIndicator({
    required this.progress,
    required this.answered,
    required this.skipped,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${answered + skipped} / $total',
              style: const TextStyle(
                fontSize: Tokens.fontSm,
                fontWeight: FontWeight.w600,
                color: Tokens.textSecondary,
              ),
            ),
            Text(
              '${(progress * 100).toStringAsFixed(0)}%',
              style: TextStyle(
                fontSize: Tokens.fontSm,
                fontWeight: FontWeight.w600,
                color: Tokens.gold,
              ),
            ),
          ],
        ),
        const SizedBox(height: Tokens.space1),
        ClipRRect(
          borderRadius: BorderRadius.circular(Tokens.radiusSm),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 6,
            backgroundColor: Tokens.surfaceBg3,
            valueColor: AlwaysStoppedAnimation(Tokens.gold),
          ),
        ),
      ],
    );
  }
}
