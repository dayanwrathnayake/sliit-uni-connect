package com.sliit.uniconnect.exception;

public class StudentIdAlreadyExistsException extends RuntimeException {
    public StudentIdAlreadyExistsException(String message) {
        super(message);
    }
}
