package com.sliit.uniconnect.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class EShopCollectionInitializer {

    @Bean
    public CommandLineRunner initEShopCollections(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                // Explicitly create E-Shop collections if they don't exist
                if (!mongoTemplate.collectionExists("products")) {
                    mongoTemplate.createCollection("products");
                    System.out.println("Created 'products' collection in MongoDB.");
                }
                if (!mongoTemplate.collectionExists("orders")) {
                    mongoTemplate.createCollection("orders");
                    System.out.println("Created 'orders' collection in MongoDB.");
                }
            } catch (Exception e) {
                System.err.println("Failed to initialize E-Shop collections: " + e.getMessage());
                // Non-blocking failure: application will still try to start
            }
        };
    }
}
