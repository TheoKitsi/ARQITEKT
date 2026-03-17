import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'tokens.dart';

/// ARQITEKT Material 3 dark theme — matches the Hub web design system.
class AppTheme {
  AppTheme._();

  static ThemeData get dark {
    final colorScheme = ColorScheme.dark(
      primary: Tokens.gold,
      onPrimary: Tokens.anthracite,
      secondary: Tokens.purple,
      onSecondary: Tokens.textPrimary,
      tertiary: Tokens.accent,
      surface: Tokens.surfaceBg,
      onSurface: Tokens.textPrimary,
      onSurfaceVariant: Tokens.textSecondary,
      surfaceContainerLowest: Tokens.surfaceBg,
      surfaceContainerLow: Tokens.surfaceBg2,
      surfaceContainer: Tokens.surfaceBg3,
      surfaceContainerHigh: Tokens.surfaceBg4,
      outline: Tokens.borderDefault,
      outlineVariant: Tokens.borderStrong,
      error: Tokens.red,
      onError: Tokens.textPrimary,
    );

    final textTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: Tokens.surfaceBg,
      textTheme: textTheme.apply(
        bodyColor: Tokens.textPrimary,
        displayColor: Tokens.textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Tokens.surfaceBg2,
        foregroundColor: Tokens.textPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: GoogleFonts.inter(
          fontSize: Tokens.fontLg,
          fontWeight: FontWeight.w600,
          color: Tokens.textPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        color: Tokens.surfaceBg2,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusLg),
          side: const BorderSide(color: Tokens.borderDefault),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Tokens.borderDefault,
        thickness: 1,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Tokens.surfaceBg2,
        indicatorColor: Tokens.gold.withValues(alpha: 0.15),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.inter(
              fontSize: Tokens.fontXs,
              fontWeight: FontWeight.w600,
              color: Tokens.gold,
            );
          }
          return GoogleFonts.inter(
            fontSize: Tokens.fontXs,
            color: Tokens.textSecondary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: Tokens.gold, size: 24);
          }
          return const IconThemeData(color: Tokens.textSecondary, size: 24);
        }),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: Tokens.gold,
        foregroundColor: Tokens.anthracite,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusLg),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Tokens.surfaceBg3,
        labelStyle: GoogleFonts.inter(
          fontSize: Tokens.fontSm,
          color: Tokens.textPrimary,
        ),
        side: const BorderSide(color: Tokens.borderDefault),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusSm),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Tokens.surfaceBg3,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
          borderSide: const BorderSide(color: Tokens.borderDefault),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
          borderSide: const BorderSide(color: Tokens.borderDefault),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
          borderSide: const BorderSide(color: Tokens.gold, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: Tokens.space4,
          vertical: Tokens.space3,
        ),
        hintStyle: GoogleFonts.inter(
          color: Tokens.textTertiary,
          fontSize: Tokens.fontBase,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: Tokens.surfaceBg3,
        contentTextStyle: GoogleFonts.inter(color: Tokens.textPrimary),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
