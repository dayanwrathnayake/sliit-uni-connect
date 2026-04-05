package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    long countByRecipientUserIdAndIsReadFalse(String userId);

    List<Notification> findByRecipientUserIdAndIsReadFalse(String userId);
}
