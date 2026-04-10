package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Product;
import com.sliit.uniconnect.model.ProductCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActive(boolean active);
    List<Product> findByClubId(String clubId);
    List<Product> findByClubIdAndActive(String clubId, boolean active);
    List<Product> findByCategoryAndActive(ProductCategory category, boolean active);
}
