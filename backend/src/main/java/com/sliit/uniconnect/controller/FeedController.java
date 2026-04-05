package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.FeedPostResponseDTO;
import com.sliit.uniconnect.service.FeedService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    /**
     * GET /api/feed?page=0&size=10
     *
     * Returns a paginated feed of posts from clubs the authenticated student follows.
     * The JWT subject (authentication.getName()) is the MongoDB _id stored in the users collection.
     * Students only — staff have no feed.
     */
    @GetMapping
    public ResponseEntity<Page<FeedPostResponseDTO>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String currentUserId = authentication.getName();
        Page<FeedPostResponseDTO> feed = feedService.getFeed(currentUserId, page, size);
        return ResponseEntity.ok(feed);
    }
}
