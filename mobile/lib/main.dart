import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme/app_theme.dart';
import 'router/router.dart';

void main() {
  runApp(const ProviderScope(child: ArqitektApp()));
}

class ArqitektApp extends StatelessWidget {
  const ArqitektApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ARQITEKT',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      routerConfig: router,
    );
  }
}
