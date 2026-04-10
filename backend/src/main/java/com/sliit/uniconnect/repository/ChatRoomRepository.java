package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.ChatRoom;
import com.sliit.uniconnect.model.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    Optional<ChatRoom> findByTypeAndReferenceId(RoomType type, String referenceId);

    List<ChatRoom> findByMemberIdsContains(String userId);
}
