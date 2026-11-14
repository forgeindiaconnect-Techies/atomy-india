package com.example.atomy_india.util;

public class PhoneUtils {

    public static String normalizeIndianPhone(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() >= 12 && digits.startsWith("91") && digits.substring(2, 3).matches("[6-9]")) {
            digits = digits.substring(2);
        } else if (digits.length() == 11 && digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (digits.length() > 10) {
            digits = digits.substring(0, 10);
        }
        return digits;
    }

    public static boolean isValidIndianPhone(String phone) {
        String clean = normalizeIndianPhone(phone);
        return clean.matches("^[6-9]\\d{9}$");
    }
}

