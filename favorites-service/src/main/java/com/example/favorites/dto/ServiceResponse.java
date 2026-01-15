package com.example.favorites;

public class ServiceResponse<T> {

    private String message;
    private T data;

    public ServiceResponse(String message, T data) {

        this.message = message;
        this.data = data;
    }

    public String getMessage() { 
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() { 
        return this.data;
    }

    public void setData(T data) {
        this.data = data;
    }
}