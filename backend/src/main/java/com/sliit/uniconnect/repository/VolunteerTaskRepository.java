package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.VolunteerTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerTaskRepository extends MongoRepository<VolunteerTask, String> {
    List<VolunteerTask> findByVolunteerApplicationId(String applicationId);
    List<VolunteerTask> findByAssignedTo(String userId);
    List<VolunteerTask> findByEventId(String eventId);
}
