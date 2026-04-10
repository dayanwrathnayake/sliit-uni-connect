package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.EventCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventCategoryRepository extends MongoRepository<EventCategory, String> {
}
