package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.StaffRole;
import com.sliit.uniconnect.model.StaffUser;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffUserRepository extends MongoRepository<StaffUser, String> {

    Optional<StaffUser> findByEmail(String email);

    Optional<StaffUser> findByStaffId(String staffId);

    List<StaffUser> findByRole(StaffRole role);

    List<StaffUser> findByFaculty(FacultyEnum faculty);

    boolean existsByEmail(String email);
}
