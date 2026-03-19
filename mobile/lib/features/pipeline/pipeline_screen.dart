import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../models/pipeline.dart';
import '../../providers/pipeline_provider.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';
import 'probing_sheet.dart';

/// Full pipeline overview for a project: gate status, confidence, drift.
class PipelineScreen extends ConsumerWidget {
  final String projectId;
  const PipelineScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pipelineAsync = ref.watch(pipelineProvider(projectId));
    final driftAsync = ref.watch(driftProvider(projectId));
    final confidenceAsync = ref.watch(confidenceProvider(projectId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pipeline'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () {
              ref.invalidate(pipelineProvider(projectId));
              ref.invalidate(driftProvider(projectId));
              ref.invalidate(confidenceProvider(projectId));
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(Tokens.space4),
        children: [
          // ── Pipeline Gates ──
          pipelineAsync.when(
            loading: () => const _LoadingCard(),
            error: (err, _) => _ErrorCard(message: '$err'),
            data: (pipeline) => _PipelineSection(
              pipeline: pipeline,
              projectId: projectId,
              ref: ref,
            ),
          ),

          const SizedBox(height: Tokens.space4),

          // ── Confidence Breakdown ──
          confidenceAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (scores) =>
                scores.isNotEmpty ? _ConfidenceSection(scores: scores) : const SizedBox.shrink(),
          ),

          const SizedBox(height: Tokens.space4),

          // ── Drift Report ──
          driftAsync.when(
            loading: () => const _LoadingCard(),
            error: (err, _) {
              final msg = '$err';
              // No baseline yet is not a real error
              if (msg.contains('404') || msg.contains('No baseline')) {
                return _NoBaselineCard(projectId: projectId, ref: ref);
              }
              return _ErrorCard(message: msg);
            },
            data: (drift) => _DriftSection(drift: drift),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Pipeline Gates Section
// ─────────────────────────────────────────────────────────────────────

class _PipelineSection extends StatelessWidget {
  final PipelineStatus pipeline;
  final String projectId;
  final WidgetRef ref;

  const _PipelineSection({
    required this.pipeline,
    required this.projectId,
    required this.ref,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Overall confidence bar
        _ConfidenceBar(value: pipeline.overallConfidence),
        const SizedBox(height: Tokens.space2),
        Text(
          '${pipeline.passedCount}/${pipeline.gates.length} Gates passed',
          style: TextStyle(
            fontSize: Tokens.fontSm,
            color: Tokens.textSecondary,
          ),
        ),
        const SizedBox(height: Tokens.space4),

        // Gate cards
        ...pipeline.gates.map((gate) => Padding(
              padding: const EdgeInsets.only(bottom: Tokens.space2),
              child: _GateCard(
                gate: gate,
                projectId: projectId,
                ref: ref,
              ),
            )),
      ],
    );
  }
}

class _GateCard extends StatelessWidget {
  final GateResult gate;
  final String projectId;
  final WidgetRef ref;

  const _GateCard({
    required this.gate,
    required this.projectId,
    required this.ref,
  });

  static const _gateLabels = {
    'G0_IDEA_TO_BC': 'Idea \u2192 BC',
    'G1_BC_TO_SOL': 'BC \u2192 Solutions',
    'G2_SOL_TO_US': 'Solutions \u2192 User Stories',
    'G3_US_TO_CMP': 'User Stories \u2192 Components',
    'G4_CMP_TO_FN': 'Components \u2192 Functions',
    'G5_FN_TO_CODE': 'Functions \u2192 Code',
  };

  @override
  Widget build(BuildContext context) {
    final label = _gateLabels[gate.gateId] ?? gate.gateId;
    final (icon, color) = _statusDecoration(gate.status);

    return Card(
      child: ExpansionTile(
        leading: Icon(icon, color: color, size: 20),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          '${gate.confidence.toStringAsFixed(0)}% confidence',
          style: TextStyle(fontSize: Tokens.fontSm, color: color),
        ),
        trailing: _EvalButton(
          gateId: gate.gateId,
          projectId: projectId,
          ref: ref,
        ),
        children: [
          if (gate.checks.isNotEmpty) ...[
            const Divider(height: 1),
            ...gate.checks.map((c) => ListTile(
                  dense: true,
                  leading: Icon(
                    c.passed ? LucideIcons.checkCircle2 : LucideIcons.xCircle,
                    size: 16,
                    color: c.passed ? Tokens.green : Tokens.red,
                  ),
                  title: Text(c.label, style: const TextStyle(fontSize: Tokens.fontSm)),
                )),
          ],
          if (gate.gaps.isNotEmpty) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: Tokens.space4, vertical: Tokens.space2),
              child: Text(
                '${gate.gaps.length} gap(s)',
                style: TextStyle(
                  fontSize: Tokens.fontSm,
                  color: Tokens.orange,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            ...gate.gaps.map((g) => ListTile(
                  dense: true,
                  leading: const Icon(LucideIcons.alertTriangle,
                      size: 16, color: Tokens.orange),
                  title: Text(g.description,
                      style: const TextStyle(fontSize: Tokens.fontSm)),
                  subtitle: Text(g.artifactId,
                      style: TextStyle(
                          fontSize: Tokens.fontXs, color: Tokens.textTertiary)),
                )),
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: Tokens.space4, vertical: Tokens.space2),
              child: OutlinedButton.icon(
                onPressed: () => showProbingSheet(
                  context,
                  projectId: projectId,
                  artifactId: gate.gaps.first.artifactId,
                ),
                icon: Icon(LucideIcons.messageCircle, size: 16, color: Tokens.gold),
                label: Text('Probe Gaps', style: TextStyle(color: Tokens.gold)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Tokens.gold.withValues(alpha: 0.4)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  (IconData, Color) _statusDecoration(String status) {
    return switch (status) {
      'passed' => (LucideIcons.checkCircle2, Tokens.green),
      'failed' => (LucideIcons.xCircle, Tokens.red),
      'blocked' => (LucideIcons.lock, Tokens.textTertiary),
      _ => (LucideIcons.circle, Tokens.textSecondary),
    };
  }
}

class _EvalButton extends StatefulWidget {
  final String gateId;
  final String projectId;
  final WidgetRef ref;

  const _EvalButton({
    required this.gateId,
    required this.projectId,
    required this.ref,
  });

  @override
  State<_EvalButton> createState() => _EvalButtonState();
}

class _EvalButtonState extends State<_EvalButton> {
  bool _loading = false;

  Future<void> _evaluate() async {
    setState(() => _loading = true);
    try {
      final api = widget.ref.read(apiClientProvider);
      await api.evaluateGate(widget.projectId, widget.gateId);
      widget.ref.invalidate(pipelineProvider(widget.projectId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }
    return IconButton(
      icon: Icon(LucideIcons.play, size: 18, color: Tokens.gold),
      tooltip: 'Evaluate',
      onPressed: _evaluate,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Confidence Bar
// ─────────────────────────────────────────────────────────────────────

class _ConfidenceBar extends StatelessWidget {
  final double value;
  const _ConfidenceBar({required this.value});

  @override
  Widget build(BuildContext context) {
    final color = value >= 90
        ? Tokens.gold
        : value >= 70
            ? Tokens.green
            : value >= 50
                ? Tokens.yellow
                : Tokens.red;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Overall Confidence',
                style: TextStyle(
                    fontSize: Tokens.fontSm,
                    color: Tokens.textSecondary,
                    fontWeight: FontWeight.w600)),
            Text('${value.toStringAsFixed(0)}%',
                style: TextStyle(
                    fontSize: Tokens.fontLg,
                    color: color,
                    fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: Tokens.space1),
        ClipRRect(
          borderRadius: BorderRadius.circular(Tokens.radiusSm),
          child: LinearProgressIndicator(
            value: value / 100,
            minHeight: 8,
            backgroundColor: Tokens.surfaceBg2,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Confidence Breakdown Section
// ─────────────────────────────────────────────────────────────────────

class _ConfidenceSection extends StatelessWidget {
  final List<ConfidenceScore> scores;
  const _ConfidenceSection({required this.scores});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Confidence Breakdown',
          style: TextStyle(
            fontSize: Tokens.fontBase,
            fontWeight: FontWeight.w600,
            color: Tokens.textPrimary,
          ),
        ),
        const SizedBox(height: Tokens.space2),
        ...scores.map((s) => Card(
              margin: const EdgeInsets.only(bottom: Tokens.space2),
              child: Padding(
                padding: const EdgeInsets.all(Tokens.space3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          s.artifactId,
                          style: const TextStyle(
                            fontFamily: 'JetBrains Mono',
                            fontSize: Tokens.fontSm,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '${s.overall.toStringAsFixed(0)}%',
                          style: TextStyle(
                            fontSize: Tokens.fontBase,
                            fontWeight: FontWeight.w700,
                            color: _scoreColor(s.overall),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Tokens.space2),
                    _DimensionBar(label: 'Structural', value: s.structural, weight: '30%'),
                    _DimensionBar(label: 'Semantic', value: s.semantic, weight: '30%'),
                    _DimensionBar(label: 'Consistency', value: s.consistency, weight: '20%'),
                    _DimensionBar(label: 'Boundary', value: s.boundary, weight: '20%'),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Color _scoreColor(double v) {
    if (v >= 90) return Tokens.gold;
    if (v >= 70) return Tokens.green;
    if (v >= 50) return Tokens.yellow;
    return Tokens.red;
  }
}

class _DimensionBar extends StatelessWidget {
  final String label;
  final double value;
  final String weight;

  const _DimensionBar({
    required this.label,
    required this.value,
    required this.weight,
  });

  @override
  Widget build(BuildContext context) {
    final color = value >= 70
        ? Tokens.green
        : value >= 50
            ? Tokens.yellow
            : Tokens.red;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(fontSize: Tokens.fontXs, color: Tokens.textSecondary),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(Tokens.radiusSm),
              child: LinearProgressIndicator(
                value: value / 100,
                minHeight: 6,
                backgroundColor: Tokens.surfaceBg3,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ),
          const SizedBox(width: Tokens.space2),
          SizedBox(
            width: 40,
            child: Text(
              '${value.toStringAsFixed(0)}%',
              textAlign: TextAlign.right,
              style: TextStyle(fontSize: Tokens.fontXs, color: Tokens.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Drift Section
// ─────────────────────────────────────────────────────────────────────

class _DriftSection extends StatelessWidget {
  final DriftReport drift;
  const _DriftSection({required this.drift});

  @override
  Widget build(BuildContext context) {
    if (!drift.drifted) {
      return Card(
        child: ListTile(
          leading: Icon(LucideIcons.shieldCheck, color: Tokens.green),
          title: const Text('No Drift'),
          subtitle: const Text('Everything matches the baseline.',
              style: TextStyle(color: Tokens.textSecondary)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Drift Detected',
          style: TextStyle(
            fontSize: Tokens.fontBase,
            fontWeight: FontWeight.w600,
            color: Tokens.orange,
          ),
        ),
        const SizedBox(height: Tokens.space2),
        _DriftSummaryRow(label: 'Added', count: drift.summary.added, color: Tokens.green),
        _DriftSummaryRow(label: 'Removed', count: drift.summary.removed, color: Tokens.red),
        _DriftSummaryRow(label: 'Changed', count: drift.summary.changed, color: Tokens.yellow),
        _DriftSummaryRow(label: 'Regressed', count: drift.summary.regressed, color: Tokens.orange),
        if (drift.items.isNotEmpty) ...[
          const SizedBox(height: Tokens.space3),
          ...drift.items.map((item) => Card(
                child: ListTile(
                  dense: true,
                  leading: Icon(_driftKindIcon(item.kind), size: 16,
                      color: _driftKindColor(item.kind)),
                  title: Text(item.artifactId,
                      style: const TextStyle(
                          fontFamily: 'JetBrains Mono', fontSize: Tokens.fontSm)),
                  subtitle: Text(item.detail,
                      style: const TextStyle(
                          fontSize: Tokens.fontXs, color: Tokens.textSecondary)),
                ),
              )),
        ],
      ],
    );
  }

  IconData _driftKindIcon(String kind) {
    return switch (kind) {
      'added' => LucideIcons.plus,
      'removed' => LucideIcons.minus,
      'title_changed' => LucideIcons.type,
      'status_regressed' => LucideIcons.arrowDown,
      'parent_changed' => LucideIcons.gitBranch,
      'content_changed' => LucideIcons.fileEdit,
      _ => LucideIcons.circle,
    };
  }

  Color _driftKindColor(String kind) {
    return switch (kind) {
      'added' => Tokens.green,
      'removed' => Tokens.red,
      'status_regressed' => Tokens.orange,
      _ => Tokens.yellow,
    };
  }
}

class _DriftSummaryRow extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _DriftSummaryRow({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    if (count == 0) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: Tokens.space2),
          Text('$count $label',
              style: TextStyle(fontSize: Tokens.fontSm, color: Tokens.textSecondary)),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  No Baseline Card
// ─────────────────────────────────────────────────────────────────────

class _NoBaselineCard extends StatefulWidget {
  final String projectId;
  final WidgetRef ref;

  const _NoBaselineCard({required this.projectId, required this.ref});

  @override
  State<_NoBaselineCard> createState() => _NoBaselineCardState();
}

class _NoBaselineCardState extends State<_NoBaselineCard> {
  bool _loading = false;

  Future<void> _setBaseline() async {
    setState(() => _loading = true);
    try {
      final api = widget.ref.read(apiClientProvider);
      await api.setBaseline(widget.projectId);
      widget.ref.invalidate(driftProvider(widget.projectId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Baseline created.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space4),
        child: Column(
          children: [
            Icon(LucideIcons.bookmark, size: 32, color: Tokens.textTertiary),
            const SizedBox(height: Tokens.space2),
            const Text('No baseline set yet.'),
            const SizedBox(height: Tokens.space3),
            FilledButton.icon(
              onPressed: _loading ? null : _setBaseline,
              icon: _loading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.black))
                  : const Icon(LucideIcons.bookmark),
              label: const Text('Set Baseline'),
              style: FilledButton.styleFrom(backgroundColor: Tokens.gold),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Shared widgets
// ─────────────────────────────────────────────────────────────────────

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(Tokens.space6),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  final String message;
  const _ErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(LucideIcons.alertTriangle, color: Tokens.red),
        title: const Text('Error'),
        subtitle: Text(message, style: const TextStyle(color: Tokens.textSecondary)),
      ),
    );
  }
}
