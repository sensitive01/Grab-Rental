package com.example.rental.common.exception;

public class AccountPendingException extends RuntimeException {
    public AccountPendingException(String message) {
        super(message);
    }
}
