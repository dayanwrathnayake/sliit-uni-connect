package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Club;
import com.sliit.uniconnect.model.ClubCategory;
import com.sliit.uniconnect.model.ClubStatus;
import com.sliit.uniconnect.model.FacultyEnum;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends MongoRepository<Club, String> {

    List<Club> findByStatus(ClubStatus status);

    List<Club> findByStatusAndCategory(ClubStatus status, ClubCategory category);

    Optional<Club> findByAdminId(String adminId);

    boolean existsByNameIgnoreCase(String name);

    /** Sorted by followerCount descending — used for "popular clubs" listing. */
    List<Club> findByStatusOrderByFollowerCountDesc(ClubStatus status);

    List<Club> findByStatusAndFaculty(ClubStatus status, FacultyEnum faculty);

    /** Case-insensitive name search within a given status. */
    List<Club> findByNameContainingIgnoreCaseAndStatus(String name, ClubStatus status);

    /** Count how many clubs a user follows — for admin user detail. */
    long countByFollowerIdsContaining(String userId);
}
