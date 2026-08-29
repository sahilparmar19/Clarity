package com.clarity.service;

import com.clarity.model.Expense;
import com.clarity.model.User;
import com.clarity.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository repo;

    public List<Expense> getAll(User user) {
        return repo.findByUserIdOrderByDateDesc(user.getId());
    }

    public List<Expense> getRange(User user, LocalDate from, LocalDate to) {
        return repo.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), from, to);
    }

    public BigDecimal sumForMonth(User user, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to   = from.withDayOfMonth(from.lengthOfMonth());
        return repo.sumAmountByUserIdAndDateBetween(user.getId(), from, to);
    }

    public Expense create(User user, Expense expense) {
        expense.setUser(user);
        return repo.save(expense);
    }

    public void delete(User user, Long id) {
        Expense e = repo.findById(id).orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!e.getUser().getId().equals(user.getId())) throw new SecurityException("Access denied");
        repo.delete(e);
    }
}
