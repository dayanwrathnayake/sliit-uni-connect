package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubApprovalDTO {

    private boolean approved;

    /** Required when approved = false. */
    private String rejectionReason;
}
