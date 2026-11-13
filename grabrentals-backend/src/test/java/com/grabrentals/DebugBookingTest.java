package com.grabrentals;

import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

class DebugBookingTest {

    @Test
    void querySupabaseDatabaseDirectly() throws Exception {
        String url = "jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String user = "postgres.gkyhyantgzwliujewrxy";
        String pass = "pgFNfFMUCZ0t41IH";

        System.out.println("Connecting to Supabase PostgreSQL...");
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            String sqlBookings = "SELECT booking_reference, status, total_fare, advance_paid, due_amount, final_total_fare, toll_charges, extra_km, extra_km_charge, is_pet_friendly, pet_charge, special_instructions " +
                                 "FROM bookings ORDER BY created_at DESC LIMIT 5";
            try (PreparedStatement ps = conn.prepareStatement(sqlBookings); ResultSet rs = ps.executeQuery()) {
                System.out.println("================ DETAILED BOOKINGS ================");
                while (rs.next()) {
                    System.out.println("Ref: " + rs.getString("booking_reference") + " | Status: " + rs.getString("status"));
                    System.out.println("  total_fare: " + rs.getBigDecimal("total_fare") + " | final_total_fare: " + rs.getBigDecimal("final_total_fare") + " | advance_paid: " + rs.getBigDecimal("advance_paid") + " | due: " + rs.getBigDecimal("due_amount"));
                    System.out.println("  toll_charges: " + rs.getBigDecimal("toll_charges") + " | extra_km: " + rs.getDouble("extra_km") + " | extra_km_charge: " + rs.getBigDecimal("extra_km_charge"));
                    System.out.println("  is_pet: " + rs.getBoolean("is_pet_friendly") + " | pet_charge: " + rs.getBigDecimal("pet_charge"));
                    System.out.println("  special_instructions: " + rs.getString("special_instructions"));
                    System.out.println("-----------------------------------------------------");
                }
            }
        }
    }
}
