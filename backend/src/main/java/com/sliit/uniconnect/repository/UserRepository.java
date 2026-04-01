package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByStudentId(String studentId);

    Optional<User> findByReferralCode(String referralCode);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

    Optional<User> findByEmailVerificationToken(String token);

    // ── Week 4: user search ──────────────────────────────────────────────────
    List<User> findByDisplayNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(
            String displayName, String studentId);
}

