import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/traceability_provider.dart';
import '../../theme/tokens.dart';

/// Simplified traceability matrix screen showing parent-child links and orphans.
class TraceabilityScreen extends ConsumerWidget {
  final String projectId;
  const TraceabilityScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final matrixAsync = ref.watch(traceabilityProvider(projectId));
    final orphansAsync = ref.watch(orphansProvider(projectId));
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.traceability),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () {
              ref.invalidate(traceabilityProvider(projectId));
              ref.invalidate(orphansProvider(projectId));
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(Tokens.space4),
        children: [
          // ── Orphans Section ──
          orphansAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => _ErrorCard(message: '$err'),
            data: (data) {
              final orphans = (data['orphans'] as List?)?.cast<String>() ?? [];
              return _OrphansSection(orphans: orphans, cs: cs);
            },
          ),

          const SizedBox(height: Tokens.space4),

          // ── Links Section ──
          matrixAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => _ErrorCard(message: '$err'),
            data: (data) {
              final links = (data['links'] as List?)?.cast<Map<String, dynamic>>() ?? [];
              final leaves = (data['leaves'] as List?)?.cast<String>() ?? [];
              return _LinksSection(links: links, leaves: leaves, cs: cs);
            },
          ),
        ],
      ),
    );
  }
}

// ─── Orphans ────────────────────────────────────────────────────────

class _OrphansSection extends StatelessWidget {
  final List<String> orphans;
  final ColorScheme cs;
  const _OrphansSection({required this.orphans, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(LucideIcons.alertTriangle,
                  size: 18, color: orphans.isEmpty ? Tokens.green : Tokens.orange),
              const SizedBox(width: Tokens.space2),
              Text(
                AppLocalizations.of(context)!.orphanedArtifacts,
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              Text(
                '${orphans.length}',
                style: TextStyle(
                  color: orphans.isEmpty ? Tokens.green : Tokens.orange,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ]),
            if (orphans.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: Tokens.space2),
                child: Text(
                  AppLocalizations.of(context)!.noOrphans,
                  style: TextStyle(color: cs.onSurfaceVariant),
                ),
              )
            else ...[
              const SizedBox(height: Tokens.space3),
              ...orphans.map(
                (id) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(children: [
                    Icon(LucideIcons.fileWarning, size: 14, color: Tokens.orange),
                    const SizedBox(width: Tokens.space2),
                    Text(id, style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 13)),
                  ]),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Trace Links ────────────────────────────────────────────────────

class _LinksSection extends StatelessWidget {
  final List<Map<String, dynamic>> links;
  final List<String> leaves;
  final ColorScheme cs;
  const _LinksSection({required this.links, required this.leaves, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(LucideIcons.gitBranch, size: 18),
              const SizedBox(width: Tokens.space2),
              Text(
                AppLocalizations.of(context)!.traceLinks,
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              Text(
                AppLocalizations.of(context)!.linkCount(links.length),
                style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
              ),
            ]),
            if (links.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: Tokens.space2),
                child: Text(
                  AppLocalizations.of(context)!.noLinks,
                  style: TextStyle(color: cs.onSurfaceVariant),
                ),
              )
            else ...[
              const SizedBox(height: Tokens.space3),
              ...links.take(50).map(
                (link) => _LinkRow(
                  from: (link['from'] ?? '').toString(),
                  to: (link['to'] ?? '').toString(),
                  relation: (link['relation'] ?? '').toString(),
                ),
              ),
              if (links.length > 50)
                Padding(
                  padding: const EdgeInsets.only(top: Tokens.space2),
                  child: Text(
                    AppLocalizations.of(context)!.moreLinks(links.length - 50),
                    style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
                  ),
                ),
            ],
            if (leaves.isNotEmpty) ...[
              const Divider(height: Tokens.space6),
              Row(children: [
                const Icon(LucideIcons.leaf, size: 16, color: Tokens.green),
                const SizedBox(width: Tokens.space2),
                Text(
                  AppLocalizations.of(context)!.leafNodes(leaves.length),
                  style: TextStyle(color: cs.onSurfaceVariant, fontSize: 13),
                ),
              ]),
              const SizedBox(height: Tokens.space2),
              Wrap(
                spacing: Tokens.space2,
                runSpacing: Tokens.space1,
                children: leaves.take(30).map((id) => Chip(
                  label: Text(id, style: const TextStyle(fontSize: 11)),
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                )).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LinkRow extends StatelessWidget {
  final String from;
  final String to;
  final String relation;
  const _LinkRow({required this.from, required this.to, required this.relation});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(from, style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 12)),
          const SizedBox(width: 4),
          Icon(LucideIcons.arrowRight, size: 12, color: Tokens.textSecondary),
          const SizedBox(width: 4),
          Text(to, style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 12)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: Tokens.surfaceBg3,
            ),
            child: Text(
              relation,
              style: const TextStyle(fontSize: 10, color: Tokens.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

class _ErrorCard extends StatelessWidget {
  final String message;
  const _ErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space4),
        child: Text(message),
      ),
    );
  }
}
