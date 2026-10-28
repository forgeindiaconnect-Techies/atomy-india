package com.example.atomy_india;

import com.example.atomy_india.model.CustomerOrder;
import com.example.atomy_india.model.OrderItem;
import com.example.atomy_india.model.OrderTracking;
import com.example.atomy_india.repository.CustomerOrderRepository;
import com.example.atomy_india.repository.OrderItemRepository;
import com.example.atomy_india.repository.OrderTrackingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AtomyIndiaApplicationTests {

	@Autowired
	private CustomerOrderRepository orderRepository;

	@Autowired
	private OrderItemRepository orderItemRepository;

	@Autowired
	private OrderTrackingRepository trackingRepository;

	@Autowired
	private com.example.atomy_india.repository.CustomerUserRepository customerUserRepository;

	@Test
	void contextLoads() {
	}

}
