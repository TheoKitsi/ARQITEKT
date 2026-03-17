/// Requirement tree node — mirrors the server's TreeNode type.
class TreeNode {
  final String id;
  final String type;
  final String title;
  final String status;
  final List<TreeNode> children;
  final String? parent;

  const TreeNode({
    required this.id,
    required this.type,
    required this.title,
    required this.status,
    this.children = const [],
    this.parent,
  });

  factory TreeNode.fromJson(Map<String, dynamic> json) {
    return TreeNode(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      title: json['title'] as String? ?? '',
      status: json['status'] as String? ?? 'idea',
      children: (json['children'] as List<dynamic>?)
              ?.map((c) => TreeNode.fromJson(c as Map<String, dynamic>))
              .toList() ??
          [],
      parent: json['parent'] as String?,
    );
  }
}

/// Requirement detail with markdown body.
class RequirementDetail {
  final String id;
  final String type;
  final String title;
  final String status;
  final String body;
  final String? parent;

  const RequirementDetail({
    required this.id,
    required this.type,
    required this.title,
    required this.status,
    required this.body,
    this.parent,
  });

  factory RequirementDetail.fromJson(Map<String, dynamic> json) {
    return RequirementDetail(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      title: json['title'] as String? ?? '',
      status: json['status'] as String? ?? 'idea',
      body: json['body'] as String? ?? '',
      parent: json['parent'] as String?,
    );
  }
}
