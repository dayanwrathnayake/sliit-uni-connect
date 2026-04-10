package com.sliit.uniconnect.repository;

import com.sliit.uniconnect.model.Order;
import com.sliit.uniconnect.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStudentId(String studentId);
    List<Order> findByClubId(String clubId);
    List<Order> findByClubIdAndStatus(String clubId, OrderStatus status);
}
