package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    Slice<Message> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);

    long countByRoomIdAndIsReadFalseAndSenderIdNot(String roomId, String userId);
}
