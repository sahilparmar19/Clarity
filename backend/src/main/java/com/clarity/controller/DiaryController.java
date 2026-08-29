package com.clarity.controller;

import com.clarity.model.DiaryEntry;
import com.clarity.model.User;
import com.clarity.service.DiaryService;
import com.clarity.service.UserService;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;
    private final UserService userService;

    /** All diary endpoints require the PIN in the X-Diary-Pin header */
    private void checkPin(User user, String pin) {
        diaryService.verifyPin(user, pin);
    }

    @GetMapping
    public List<DiaryEntry> getAll(@AuthenticationPrincipal User user,
                                   @RequestHeader("X-Diary-Pin") String pin) {
        checkPin(user, pin);
        return diaryService.getAll(user);
    }

    @GetMapping("/{date}")
    public DiaryEntry getByDate(@AuthenticationPrincipal User user,
                                @RequestHeader("X-Diary-Pin") String pin,
                                @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        checkPin(user, pin);
        return diaryService.getByDate(user, date);
    }

    @PutMapping("/{date}")
    public ResponseEntity<DiaryEntry> save(@AuthenticationPrincipal User user,
                                           @RequestHeader("X-Diary-Pin") String pin,
                                           @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                           @RequestBody DiaryEntry body) {
        checkPin(user, pin);
        return ResponseEntity.ok(diaryService.save(user, date, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user,
                                       @RequestHeader("X-Diary-Pin") String pin,
                                       @PathVariable Long id) {
        checkPin(user, pin);
        diaryService.delete(user, id);
        return ResponseEntity.noContent().build();
    }

    // --- PIN management (no existing PIN needed to set the first one) ---
    @Data
    static class PinRequest { @NotBlank private String pin; }

    @PostMapping("/pin")
    public ResponseEntity<Void> setPin(@AuthenticationPrincipal User user,
                                       @RequestBody PinRequest req) {
        userService.setDiaryPin(user, req.getPin());
        return ResponseEntity.ok().build();
    }
}
