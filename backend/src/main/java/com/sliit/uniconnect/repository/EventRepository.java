package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Event;
import com.sliit.uniconnect.model.EventStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByCreatedBy(String userId);

    List<Event> findByClubId(String clubId);

    @Query("{ 'status': 'PUBLISHED', 'startDate': { $gte: ?0, $lte: ?1 } }")
    List<Event> findPublishedEventsBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByRegisteredUserIdsContains(String userId);

    @Query("{ 'status': 'PENDING_DEPT' }")
    List<Event> findPendingDeptApprovals();

    @Query("{ 'status': 'PENDING_FACULTY' }")
    List<Event> findPendingFacultyApprovals();

    @Query("{ 'status': 'PUBLISHED', 'startDate': { $gte: ?0 } }")
    List<Event> findUpcomingEvents(java.time.LocalDateTime now, org.springframework.data.domain.Pageable pageable);
}
