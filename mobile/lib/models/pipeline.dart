// Pipeline models — mirrors the server's pipeline/confidence/baseline types.

class GateCheck {
  final String label;
  final bool passed;
  final String? detail;

  const GateCheck({required this.label, required this.passed, this.detail});

  factory GateCheck.fromJson(Map<String, dynamic> json) {
    return GateCheck(
      label: json['label'] as String? ?? '',
      passed: json['passed'] as bool? ?? false,
      detail: json['detail'] as String?,
    );
  }
}

class Gap {
  final String artifactId;
  final String description;
  final String severity;

  const Gap({required this.artifactId, required this.description, required this.severity});

  factory Gap.fromJson(Map<String, dynamic> json) {
    return Gap(
      artifactId: json['artifactId'] as String? ?? '',
      description: json['description'] as String? ?? '',
      severity: json['severity'] as String? ?? 'medium',
    );
  }
}

class GateResult {
  final String gateId;
  final String status; // passed, failed, blocked, skipped
  final List<GateCheck> checks;
  final List<Gap> gaps;
  final double confidence;
  final String? overrideReason;

  const GateResult({
    required this.gateId,
    required this.status,
    this.checks = const [],
    this.gaps = const [],
    this.confidence = 0,
    this.overrideReason,
  });

  factory GateResult.fromJson(Map<String, dynamic> json) {
    return GateResult(
      gateId: json['gateId'] as String? ?? '',
      status: json['status'] as String? ?? 'blocked',
      checks: (json['checks'] as List<dynamic>?)
              ?.map((c) => GateCheck.fromJson(c as Map<String, dynamic>))
              .toList() ??
          [],
      gaps: (json['gaps'] as List<dynamic>?)
              ?.map((g) => Gap.fromJson(g as Map<String, dynamic>))
              .toList() ??
          [],
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0,
      overrideReason: json['overrideReason'] as String?,
    );
  }
}

class PipelineStatus {
  final String projectId;
  final List<GateResult> gates;
  final double overallConfidence;

  const PipelineStatus({
    required this.projectId,
    this.gates = const [],
    this.overallConfidence = 0,
  });

  int get passedCount => gates.where((g) => g.status == 'passed').length;

  factory PipelineStatus.fromJson(Map<String, dynamic> json) {
    return PipelineStatus(
      projectId: json['projectId'] as String? ?? '',
      gates: (json['gates'] as List<dynamic>?)
              ?.map((g) => GateResult.fromJson(g as Map<String, dynamic>))
              .toList() ??
          [],
      overallConfidence: (json['overallConfidence'] as num?)?.toDouble() ?? 0,
    );
  }
}

class ConfidenceScore {
  final String artifactId;
  final double overall;
  final double structural;
  final double semantic;
  final double consistency;
  final double boundary;

  const ConfidenceScore({
    required this.artifactId,
    this.overall = 0,
    this.structural = 0,
    this.semantic = 0,
    this.consistency = 0,
    this.boundary = 0,
  });

  factory ConfidenceScore.fromJson(Map<String, dynamic> json) {
    return ConfidenceScore(
      artifactId: json['artifactId'] as String? ?? '',
      overall: (json['overall'] as num?)?.toDouble() ?? 0,
      structural: (json['structural'] as num?)?.toDouble() ?? 0,
      semantic: (json['semantic'] as num?)?.toDouble() ?? 0,
      consistency: (json['consistency'] as num?)?.toDouble() ?? 0,
      boundary: (json['boundary'] as num?)?.toDouble() ?? 0,
    );
  }
}

class DriftItem {
  final String artifactId;
  final String kind;
  final String detail;

  const DriftItem({required this.artifactId, required this.kind, required this.detail});

  factory DriftItem.fromJson(Map<String, dynamic> json) {
    return DriftItem(
      artifactId: json['artifactId'] as String? ?? '',
      kind: json['kind'] as String? ?? '',
      detail: json['detail'] as String? ?? '',
    );
  }
}

class DriftSummary {
  final int added;
  final int removed;
  final int changed;
  final int regressed;

  const DriftSummary({this.added = 0, this.removed = 0, this.changed = 0, this.regressed = 0});

  int get total => added + removed + changed + regressed;

  factory DriftSummary.fromJson(Map<String, dynamic> json) {
    return DriftSummary(
      added: json['added'] as int? ?? 0,
      removed: json['removed'] as int? ?? 0,
      changed: json['changed'] as int? ?? 0,
      regressed: json['regressed'] as int? ?? 0,
    );
  }
}

class DriftReport {
  final String projectId;
  final String baselineDate;
  final String checkedAt;
  final bool drifted;
  final List<DriftItem> items;
  final DriftSummary summary;

  const DriftReport({
    required this.projectId,
    required this.baselineDate,
    required this.checkedAt,
    this.drifted = false,
    this.items = const [],
    this.summary = const DriftSummary(),
  });

  factory DriftReport.fromJson(Map<String, dynamic> json) {
    return DriftReport(
      projectId: json['projectId'] as String? ?? '',
      baselineDate: json['baselineDate'] as String? ?? '',
      checkedAt: json['checkedAt'] as String? ?? '',
      drifted: json['drifted'] as bool? ?? false,
      items: (json['items'] as List<dynamic>?)
              ?.map((i) => DriftItem.fromJson(i as Map<String, dynamic>))
              .toList() ??
          [],
      summary: DriftSummary.fromJson(
          json['summary'] as Map<String, dynamic>? ?? {}),
    );
  }
}
