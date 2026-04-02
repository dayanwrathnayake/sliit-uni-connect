package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.ClubPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubPostRepository extends MongoRepository<ClubPost, String> {

    List<ClubPost> findByClubIdOrderByCreatedAtDesc(String clubId);

    /** Used in Week 7 feed aggregation — fetches posts from multiple clubs at once. */
    List<ClubPost> findByClubIdInOrderByCreatedAtDesc(List<String> clubIds);

    void deleteByClubId(String clubId);
}
