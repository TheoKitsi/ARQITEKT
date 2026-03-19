// Probing models — mirrors the server's probing types.

class ProbingOption {
  final String id;
  final String label;
  final String impact;

  const ProbingOption({required this.id, required this.label, required this.impact});

  factory ProbingOption.fromJson(Map<String, dynamic> json) {
    return ProbingOption(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? '',
      impact: json['impact'] as String? ?? '',
    );
  }
}

class ProbingQuestion {
  final String id;
  final String agentType;
  final String gapId;
  final String artifactId;
  final String question;
  final List<ProbingOption> options;
  final String whyImportant;
  final String estimatedImpact;
  final bool canSkip;
  final String status; // open, answered, skipped
  final String? answer;
  final String? skipReason;

  const ProbingQuestion({
    required this.id,
    required this.agentType,
    required this.gapId,
    required this.artifactId,
    required this.question,
    this.options = const [],
    this.whyImportant = '',
    this.estimatedImpact = 'medium',
    this.canSkip = true,
    this.status = 'open',
    this.answer,
    this.skipReason,
  });

  factory ProbingQuestion.fromJson(Map<String, dynamic> json) {
    return ProbingQuestion(
      id: json['id'] as String? ?? '',
      agentType: json['agentType'] as String? ?? 'socratic',
      gapId: json['gapId'] as String? ?? '',
      artifactId: json['artifactId'] as String? ?? '',
      question: json['question'] as String? ?? '',
      options: (json['options'] as List<dynamic>?)
              ?.map((o) => ProbingOption.fromJson(o as Map<String, dynamic>))
              .toList() ??
          [],
      whyImportant: json['whyImportant'] as String? ?? '',
      estimatedImpact: json['estimatedImpact'] as String? ?? 'medium',
      canSkip: json['canSkip'] as bool? ?? true,
      status: json['status'] as String? ?? 'open',
      answer: json['answer'] as String?,
      skipReason: json['skipReason'] as String?,
    );
  }
}

class ProbingSession {
  final String projectId;
  final String artifactId;
  final List<ProbingQuestion> questions;
  final int total;
  final int open;
  final int answered;
  final int skipped;

  const ProbingSession({
    required this.projectId,
    required this.artifactId,
    this.questions = const [],
    this.total = 0,
    this.open = 0,
    this.answered = 0,
    this.skipped = 0,
  });

  bool get completed => total > 0 && open == 0;

  List<ProbingQuestion> get openQuestions =>
      questions.where((q) => q.status == 'open').toList();

  factory ProbingSession.fromJson(Map<String, dynamic> json) {
    final questions = (json['questions'] as List<dynamic>?)
            ?.map((q) => ProbingQuestion.fromJson(q as Map<String, dynamic>))
            .toList() ??
        [];
    return ProbingSession(
      projectId: json['projectId'] as String? ?? '',
      artifactId: json['artifactId'] as String? ?? '',
      questions: questions,
      total: json['total'] as int? ?? questions.length,
      open: json['open'] as int? ?? questions.where((q) => q.status == 'open').length,
      answered: json['answered'] as int? ?? questions.where((q) => q.status == 'answered').length,
      skipped: json['skipped'] as int? ?? questions.where((q) => q.status == 'skipped').length,
    );
  }
}
