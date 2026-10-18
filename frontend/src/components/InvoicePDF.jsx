import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12 },
    header: { marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 24, marginBottom: 10 },
    section: { marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    table: { display: 'table', width: '100%', marginTop: 10 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 5 },
    tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
    tableCell: { flex: 1, paddingHorizontal: 5 },
    total: { marginTop: 20, textAlign: 'right', fontWeight: 'bold' },
});

export const InvoicePDF = ({ order }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Invoice</Text>
                <Text>Order #{order._id?.slice(-8).toUpperCase()}</Text>
                <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold' }}>Shipping Address:</Text>
                <Text>{order.shippingAddress?.address}</Text>
                <Text>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</Text>
                <Text>{order.shippingAddress?.country}</Text>
                {order.shippingAddress?.phone && <Text>Phone: {order.shippingAddress.phone}</Text>}
            </View>
            
            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Product</Text>
                    <Text style={styles.tableCell}>Quantity</Text>
                    <Text style={styles.tableCell}>Price</Text>
                    <Text style={styles.tableCell}>Total</Text>
                </View>
                {order.orderItems?.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.name}</Text>
                        <Text style={styles.tableCell}>{item.qty}</Text>
                        <Text style={styles.tableCell}>${item.price}</Text>
                        <Text style={styles.tableCell}>${(item.price * item.qty).toFixed(2)}</Text>
                    </View>
                ))}
            </View>
            
            <View style={styles.total}>
                <Text>Subtotal: ${order.itemsPrice?.toFixed(2)}</Text>
                <Text>Shipping: ${order.shippingPrice?.toFixed(2)}</Text>
                <Text>Tax: ${order.taxPrice?.toFixed(2)}</Text>
                {order.discountAmount > 0 && <Text>Discount {order.couponCode && `(${order.couponCode})`}: -${order.discountAmount?.toFixed(2)}</Text>}
                <Text style={{ fontSize: 16 }}>Total: ${order.totalPrice?.toFixed(2)}</Text>
            </View>
        </Page>
    </Document>
);