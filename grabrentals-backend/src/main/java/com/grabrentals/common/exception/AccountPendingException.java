package com.grabrentals.common.exception;

public class AccountPendingException extends RuntimeException {
    public AccountPendingException(String message) {
        super(message);
    }
}
