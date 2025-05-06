package com.TodoApp.Todo_APP.config;

import java.util.Base64;

public class KeyDecoder {
    public static String decode(String encodedKey) {
        return new String(Base64.getDecoder().decode(encodedKey));
    }

    public static void main(String[] args) {
        String temp = "c2stcHJvai0yWTZmYmJLSXNPLUlQT2Exd29BR1JmQ1NwNmxBZGZ3UmpwU1V1V1VuazM3dElnWHB5X2lZZGVWZDd0SnE4X1B6SHZ5R0xCdC05UVQzQmxia0ZKOUl2SWRGWlBqS3ZscnM2Y3YzRktrTDFVcGQ5andvT2FWVGJaRWRnazhSRUVwbzV5SEZ5TUlFNjh0ejdUN2ZmZXJ3VDBrRjZzSUE";
        String ans = new String(Base64.getDecoder().decode(temp));
        System.out.println(ans);
    }
}
