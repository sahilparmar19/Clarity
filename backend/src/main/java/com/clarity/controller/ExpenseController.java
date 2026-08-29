package com.clarity.controller;

import com.clarity.model.Expense;
import com.clarity.model.User;
import com.clarity.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public List<Expense> getAll(@AuthenticationPrincipal User user,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from != null && to != null) return expenseService.getRange(user, from, to);
        return expenseService.getAll(user);
    }

    @GetMapping("/summary")
    public BigDecimal monthSummary(@AuthenticationPrincipal User user,
                                   @RequestParam int year,
                                   @RequestParam int month) {
        return expenseService.sumForMonth(user, year, month);
    }

    @PostMapping
    public ResponseEntity<Expense> create(@AuthenticationPrincipal User user,
                                          @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.create(user, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user,
                                       @PathVariable Long id) {
        expenseService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
