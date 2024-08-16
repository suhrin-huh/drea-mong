package com.ssafy.dreamong.domain.entity.user.repository;


import com.ssafy.dreamong.domain.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByProviderUserId(String providerUserId);

    Optional<User> findById(Integer userId);

    boolean existsByNickname(String nickname);

}