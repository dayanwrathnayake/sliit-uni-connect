package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.CertificateRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRequestRepository extends MongoRepository<CertificateRequest, String> {
    List<CertificateRequest> findByUserId(String userId);
    Optional<CertificateRequest> findByUserIdAndEventId(String userId, String eventId);
}
