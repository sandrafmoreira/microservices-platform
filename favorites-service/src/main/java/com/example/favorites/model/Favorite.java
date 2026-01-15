package com.example.favorites;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "favorites")
public class Favorite {

    @Id
    private String id;

    private String userId;
    private String targetValue;
    private String targetId; 

    public Favorite() {}

    public Favorite(String userId, String targetValue, String targetId) {
        this.userId = userId;
        this.targetValue = targetValue;
        this.targetId = targetId;
    }

    public String getId() { 
        return id; 
    }

    public String getUserId() { 
        return userId; 
    }

    public void setUserId(String userId) { 
        this.userId = userId; 
    }

    public String getTargetValue() { 
        return targetValue; 
    }

    public void setTargetValue(String targetValue) { 
        this.targetValue = targetValue; 
    }

    public String getTargetId() { 
        return targetId; 
    }

    public void setTargetId(String targetId) { 
        this.targetId = targetId; 
    }
}