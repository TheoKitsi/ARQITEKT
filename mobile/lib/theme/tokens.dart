import 'package:flutter/material.dart';

/// ARQITEKT design tokens — ported from ui-catalogue/tokens/*.json
class Tokens {
  Tokens._();

  // ── Brand ──────────────────────────────────────────────────────────
  static const Color gold = Color(0xFFFFD700);
  static const Color anthracite = Color(0xFF1F1F1F);

  // ── Surfaces ───────────────────────────────────────────────────────
  static const Color surfaceBg = Color(0xFF0D1117);
  static const Color surfaceBg2 = Color(0xFF161B22);
  static const Color surfaceBg3 = Color(0xFF21262D);
  static const Color surfaceBg4 = Color(0xFF30363D);

  // ── Text ───────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFFE6EDF3);
  static const Color textSecondary = Color(0xFF8B949E);
  static const Color textTertiary = Color(0xFF6E7681);

  // ── Semantic ───────────────────────────────────────────────────────
  static const Color accent = Color(0xFF58A6FF);
  static const Color green = Color(0xFF3FB950);
  static const Color yellow = Color(0xFFD29922);
  static const Color orange = Color(0xFFDB6D28);
  static const Color red = Color(0xFFF85149);
  static const Color purple = Color(0xFFBC8CFF);

  // ── Border ─────────────────────────────────────────────────────────
  static const Color borderDefault = Color(0xFF30363D);
  static const Color borderStrong = Color(0xFF484F58);

  // ── Spacing (4px base) ─────────────────────────────────────────────
  static const double space0 = 0;
  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 20;
  static const double space6 = 24;
  static const double space8 = 32;
  static const double space10 = 40;
  static const double space12 = 48;

  // ── Radii ──────────────────────────────────────────────────────────
  static const double radiusNone = 0;
  static const double radiusSm = 4;
  static const double radiusMd = 8;
  static const double radiusLg = 12;
  static const double radiusXl = 16;
  static const double radiusFull = 999;

  // ── Typography sizes ───────────────────────────────────────────────
  static const double fontXs = 11;
  static const double fontSm = 13;
  static const double fontBase = 15;
  static const double fontLg = 17;
  static const double fontXl = 22;
  static const double font2xl = 28;
}
