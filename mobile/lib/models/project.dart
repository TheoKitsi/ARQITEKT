/// Project model — mirrors the server's Project type.
class Project {
  final String id;
  final String path;
  final ProjectConfig config;
  final ProjectStats stats;

  const Project({
    required this.id,
    required this.path,
    required this.config,
    required this.stats,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] as String? ?? '',
      path: json['path'] as String? ?? '',
      config: ProjectConfig.fromJson(json['config'] as Map<String, dynamic>? ?? {}),
      stats: ProjectStats.fromJson(json['stats'] as Map<String, dynamic>? ?? {}),
    );
  }
}

class ProjectConfig {
  final String name;
  final String codename;
  final String? description;
  final String lifecycle;
  final String? github;
  final List<String> tags;
  final ProjectBranding? branding;

  const ProjectConfig({
    required this.name,
    required this.codename,
    this.description,
    required this.lifecycle,
    this.github,
    this.tags = const [],
    this.branding,
  });

  factory ProjectConfig.fromJson(Map<String, dynamic> json) {
    return ProjectConfig(
      name: json['name'] as String? ?? '',
      codename: json['codename'] as String? ?? '',
      description: json['description'] as String?,
      lifecycle: json['lifecycle'] as String? ?? 'planning',
      github: json['github'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
      branding: json['branding'] != null
          ? ProjectBranding.fromJson(json['branding'] as Map<String, dynamic>)
          : null,
    );
  }
}

class ProjectBranding {
  final String? primaryColor;
  final String? secondaryColor;
  final String? logo;
  final String? mode;

  const ProjectBranding({this.primaryColor, this.secondaryColor, this.logo, this.mode});

  factory ProjectBranding.fromJson(Map<String, dynamic> json) {
    return ProjectBranding(
      primaryColor: json['primaryColor'] as String?,
      secondaryColor: json['secondaryColor'] as String?,
      logo: json['logo'] as String?,
      mode: json['mode'] as String?,
    );
  }
}

class ProjectStats {
  final int bc;
  final int sol;
  final int us;
  final int cmp;
  final int fn;
  final int inf;
  final int adr;
  final int ntf;
  final int conv;
  final int fbk;

  const ProjectStats({
    this.bc = 0, this.sol = 0, this.us = 0, this.cmp = 0,
    this.fn = 0, this.inf = 0, this.adr = 0, this.ntf = 0,
    this.conv = 0, this.fbk = 0,
  });

  int get total => bc + sol + us + cmp + fn + inf + adr + ntf + conv + fbk;

  factory ProjectStats.fromJson(Map<String, dynamic> json) {
    return ProjectStats(
      bc: json['bc'] as int? ?? 0,
      sol: json['sol'] as int? ?? 0,
      us: json['us'] as int? ?? 0,
      cmp: json['cmp'] as int? ?? 0,
      fn: json['fn'] as int? ?? 0,
      inf: json['inf'] as int? ?? 0,
      adr: json['adr'] as int? ?? 0,
      ntf: json['ntf'] as int? ?? 0,
      conv: json['conv'] as int? ?? 0,
      fbk: json['fbk'] as int? ?? 0,
    );
  }
}
