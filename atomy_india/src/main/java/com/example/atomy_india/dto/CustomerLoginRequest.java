package com.example.atomy_india.dto;

public class CustomerLoginRequest {

    private String usernameOrEmail;
    private String password;

    public CustomerLoginRequest() {}

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
