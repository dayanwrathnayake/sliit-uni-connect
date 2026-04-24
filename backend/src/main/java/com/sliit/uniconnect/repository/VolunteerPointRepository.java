package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.VolunteerPoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerPointRepository extends MongoRepository<VolunteerPoint, String> {
    List<VolunteerPoint> findByUserId(String userId);
    List<VolunteerPoint> findByEventId(String eventId);
}
