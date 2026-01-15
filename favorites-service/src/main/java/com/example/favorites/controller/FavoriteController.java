package com.example.favorites;

import org.springframework.beans.factory.annotation.Autowired; 
 
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.*; 
import org.springframework.http.ResponseEntity;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional; 

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    // @Autowired
    // private FavoriteRepository repository;

    private final FavoriteRepository repository;

    public FavoriteController (FavoriteRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<ServiceResponse<Favorite>> createFavorite(@RequestBody Favorite favorite, @RequestHeader("Authorization") String authHeader) {
        
        if (favorite.getTargetId() == null || favorite.getTargetValue() == null || favorite.getUserId() == null) {
            
            ServiceResponse<Favorite> res = new ServiceResponse<>("POST Favorite Request: UserId / TargetId / TargetValue fields are missing.",null);
            return ResponseEntity.badRequest().body(res);
        }

        String endpoint;

        if (favorite.getTargetValue().equals("seller")) {
                
            endpoint = "http://localhost:3000/users/sellers/" + favorite.getTargetId();

        } else if (favorite.getTargetValue().equals("market")) {

            endpoint = "http://localhost:3009/markets/" + favorite.getTargetId();

        } else {

            ServiceResponse<Favorite> res = new ServiceResponse<>("POST Favorite Request: TargetId must be seller or market.",null);
            return ResponseEntity.badRequest().body(res);
        }
        
        try {

            RestTemplate restTemp = new RestTemplate();

            String token = authHeader.replace("Bearer ", "");

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            
            HttpEntity<String> entity = new HttpEntity<>(headers); 
            
            ResponseEntity<String> response = restTemp.exchange(
                endpoint, 
                HttpMethod.GET, 
                entity,
                String.class);
            
            if (!response.getStatusCode().equals(HttpStatus.OK)) { 

                ServiceResponse<Favorite> res = new ServiceResponse<>("POST Favorite Request failed." ,null);
                return ResponseEntity.badRequest().body(res);
            } 

        } catch (Exception e) {
                
            ServiceResponse<Favorite> res = new ServiceResponse<>("POST Favorite Request: TargetId not valid.", null);
            return ResponseEntity.badRequest().body(res);
        }
        
        Favorite favoriteCreated = repository.save(favorite);

        ServiceResponse<Favorite> res = new ServiceResponse<>("POST Favorite Request was successful.", favoriteCreated);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }


    @GetMapping
    public ResponseEntity<ServiceResponse<List<Favorite>>> getAllFavorites() {
        
        List<Favorite> list = repository.findAll();

        if (list.isEmpty()) {
            ServiceResponse<List<Favorite>> res = new ServiceResponse<>("GET All Favorites Request: No Favorites were found.", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }

        ServiceResponse<List<Favorite>> res = new ServiceResponse<>("GET All Favorites Request was successful.", list);
        return ResponseEntity.ok(res);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse<Favorite>> getFavoriteById(@PathVariable String id) {
        
        Optional<Favorite> favorite = repository.findById(id);

        if (favorite.isPresent()) {
            
            ServiceResponse<Favorite> res = new ServiceResponse<>("GET Favorite By ID Request was successful.", favorite.get());
            return ResponseEntity.ok(res);
        
        } else {

            ServiceResponse<Favorite> res = new ServiceResponse<>("GET Favorite By ID Request failed.", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<ServiceResponse<List<Favorite>>> getFavoritesByUser(@PathVariable String userId) {
        
        List<Favorite> list = repository.findByUserId(userId);

        if (list.isEmpty()) {

            ServiceResponse<List<Favorite>> res = new ServiceResponse<>("GET Favorites By User ID Request: No Favorites were found for this user.",null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }

        ServiceResponse<List<Favorite>> res = new ServiceResponse<>("GET Favorites by User ID Request was successful.", list);
        return ResponseEntity.ok(res);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ServiceResponse<String>> deleteFavorite(@PathVariable String id) {
        
        Optional<Favorite> favorite = repository.findById(id);

        if (favorite.isEmpty()) {
            
            ServiceResponse<String> res = new ServiceResponse<>("DELETE Favorite Request: Favorite not found.", null);
            return ResponseEntity.badRequest().body(res);
        }

        repository.deleteById(id);

        ServiceResponse<String> res = new ServiceResponse<>("DELETE Favorite Request was successful.", id);
        return ResponseEntity.ok(res);
    }
}
