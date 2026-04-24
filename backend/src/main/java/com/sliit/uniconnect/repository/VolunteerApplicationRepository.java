package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.VolunteerApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerApplicationRepository extends MongoRepository<VolunteerApplication, String> {
    List<VolunteerApplication> findByEventId(String eventId);
    List<VolunteerApplication> findByUserId(String userId);
    Optional<VolunteerApplication> findByUserIdAndEventId(String userId, String eventId);
}
