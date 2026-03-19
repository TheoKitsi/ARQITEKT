import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/projects_provider.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

class CaptureScreen extends ConsumerStatefulWidget {
  const CaptureScreen({super.key});

  @override
  ConsumerState<CaptureScreen> createState() => _CaptureScreenState();
}

class _CaptureScreenState extends ConsumerState<CaptureScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String? _selectedProjectId;
  String _severity = 'improvement';
  bool _submitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final title = _titleController.text.trim();
    if (title.isEmpty || _selectedProjectId == null || _submitting) return;

    setState(() => _submitting = true);

    try {
      final api = ref.read(apiClientProvider);
      await api.createFeedback(
        _selectedProjectId!,
        title: title,
        description: _descController.text.trim(),
        severity: _severity,
      );

      if (mounted) {
        _titleController.clear();
        _descController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Idee erfasst!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fehler: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(projectsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Idee erfassen')),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
        padding: const EdgeInsets.all(Tokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Project selector
            projectsAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const Text('Projekte laden fehlgeschlagen'),
              data: (projects) {
                return DropdownButtonFormField<String>(
                  value: _selectedProjectId,
                  decoration: const InputDecoration(
                    labelText: 'Projekt',
                    prefixIcon: Icon(LucideIcons.folderKanban),
                  ),
                  items: projects
                      .map((p) => DropdownMenuItem(
                            value: p.id,
                            child: Text(p.config.name),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedProjectId = v),
                );
              },
            ),

            const SizedBox(height: Tokens.space4),

            // Title
            TextFormField(
              controller: _titleController,
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Titel erforderlich' : null,
              decoration: const InputDecoration(
                labelText: 'Titel',
                prefixIcon: Icon(LucideIcons.lightbulb),
                hintText: 'Beschreibe deine Idee kurz...',
              ),
            ),

            const SizedBox(height: Tokens.space4),

            // Description
            TextField(
              controller: _descController,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Beschreibung (optional)',
                hintText: 'Details, Kontext, Screenshots...',
                alignLabelWithHint: true,
              ),
            ),

            const SizedBox(height: Tokens.space4),

            // Severity selector
            Text(
              'Typ',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: Tokens.textSecondary,
                  ),
            ),
            const SizedBox(height: Tokens.space2),
            Wrap(
              spacing: Tokens.space2,
              children: [
                _SeverityChip(
                  label: 'Wunsch',
                  value: 'wish',
                  selected: _severity == 'wish',
                  color: Tokens.accent,
                  onTap: () => setState(() => _severity = 'wish'),
                ),
                _SeverityChip(
                  label: 'Verbesserung',
                  value: 'improvement',
                  selected: _severity == 'improvement',
                  color: Tokens.green,
                  onTap: () => setState(() => _severity = 'improvement'),
                ),
                _SeverityChip(
                  label: 'Bug',
                  value: 'bug',
                  selected: _severity == 'bug',
                  color: Tokens.orange,
                  onTap: () => setState(() => _severity = 'bug'),
                ),
                _SeverityChip(
                  label: 'Kritisch',
                  value: 'critical',
                  selected: _severity == 'critical',
                  color: Tokens.red,
                  onTap: () => setState(() => _severity = 'critical'),
                ),
              ],
            ),

            const SizedBox(height: Tokens.space6),

            // Submit
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(LucideIcons.plus),
              label: const Text('Idee erfassen'),
            ),
          ],
        ),
      ),
      ),
    );
  }
}

class _SeverityChip extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  const _SeverityChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: color.withValues(alpha: 0.2),
      checkmarkColor: color,
      labelStyle: TextStyle(
        color: selected ? color : Tokens.textSecondary,
        fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
      ),
    );
  }
}
