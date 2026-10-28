package com.example.atomy_india;

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

	@Test
	void cleanGopalAndTestOrdersFromDatabase() {
		orderRepository.findAll().stream()
				.filter(o -> "ORD-20261028-3207".equalsIgnoreCase(o.getOrderId())
						|| (o.getCustomerEmail() != null && o.getCustomerEmail().toLowerCase().contains("gopal"))
						|| (o.getCustomerName() != null && o.getCustomerName().toLowerCase().contains("gopal"))
						|| (o.getOrderId() != null && o.getOrderId().toUpperCase().contains("TEST")))
				.forEach(o -> {
					System.out.println("DELETING UNWANTED ORDER FROM MONGODB ATLAS: " + o.getOrderId() + " (" + o.getCustomerName() + " - " + o.getTotalAmount() + ")");
					orderRepository.delete(o);
					trackingRepository.findByOrderId(o.getOrderId()).ifPresent(trackingRepository::delete);
					orderItemRepository.findAll().stream()
							.filter(it -> o.getOrderId().equals(it.getOrderId()))
							.forEach(orderItemRepository::delete);
				});
	}

}
