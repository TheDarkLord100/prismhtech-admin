import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import { COMPANY } from "./company";
import { amountToWords } from "./amountToWords";

const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 9 },
    row: { flexDirection: "row" },
    col: { flexDirection: "column" },
    border: { border: "1px solid #000" },
    cell: { padding: 4, borderRight: "1px solid #000" },
    header: { fontWeight: "bold" },
    right: { textAlign: "right" },
    center: { textAlign: "center" },
    headerRow: {
        flexDirection: "row",
        border: "1px solid #000",
    },

    leftCol: {
        width: "60%",
        padding: 6,
        borderRight: "1px solid #000",
    },

    rightCol: {
        width: "40%",
        padding: 6,
    },

    sellerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },

    logo: {
        width: 40,
        height: 40,
        marginRight: 8,
    },

    sellerName: {
        fontSize: 12,
        fontWeight: "bold",
    },

    text: {
        fontSize: 9,
    },

    bold: {
        fontWeight: "bold",
    },

    metaRow: {
        flexDirection: "row",
        borderBottom: "1px solid #000",
    },

    metaCellLabel: {
        width: "55%",
        fontSize: 9,
        padding: 4,
        borderRight: "1px solid #000",
    },

    metaCellValue: {
        width: "45%",
        fontSize: 9,
        padding: 4,
    },

});

export function InvoicePdf({ order }: any) {
    const totalTaxable = order.items.reduce(
        (s: number, i: any) => s + i.price * i.quantity,
        0
    );

    const cgst = totalTaxable * 0.09;
    const sgst = totalTaxable * 0.09;
    const grandTotal = totalTaxable + cgst + sgst;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    {/* LEFT COLUMN */}
                    <View style={styles.leftCol}>
                        {/* SELLER */}
                        <View style={styles.sellerHeader}>
                            <Image src={order.seller.logo} style={styles.logo} />

                            <View>
                                <Text style={styles.sellerName}>{order.seller.name}</Text>
                                <Text style={styles.text}>{order.seller.address}</Text>
                            </View>
                        </View>

                        <Text style={styles.text}>UDYAM: {order.seller.udyam}</Text>
                        <Text style={styles.text}>GSTIN: {order.seller.gstin}</Text>
                        <Text style={styles.text}>
                            State Name: {order.seller.state}, Code: {order.seller.state_code}
                        </Text>
                        <Text style={styles.text}>Contact: {order.seller.phone}</Text>
                        <Text style={styles.text}>Email: {order.seller.email}</Text>

                        {/* CONSIGNEE */}
                        <View style={{ marginTop: 6, borderTop: "1px solid #000", paddingTop: 6 }}>
                            <Text style={[styles.text, styles.bold]}>
                                Consignee (Ship to)
                            </Text>
                            <Text style={styles.bold}>{order.shipping_address.name}</Text>
                            <Text style={styles.text}>
                                {order.shipping_address.address_l1},{" "}
                                {order.shipping_address.address_l2}
                            </Text>
                            <Text style={styles.text}>
                                {order.shipping_address.city}, {order.shipping_address.state}
                            </Text>
                            <Text style={styles.text}>
                                GSTIN/UIN: {order.shipping_address.gstin || "—"}
                            </Text>
                        </View>

                        {/* BUYER */}
                        <View style={{ marginTop: 6 }}>
                            <Text style={[styles.text, styles.bold]}>
                                Buyer (Bill to)
                            </Text>
                            <Text style={styles.bold}>{order.billing_address.name}</Text>
                            <Text style={styles.text}>
                                {order.billing_address.address_l1},{" "}
                                {order.billing_address.address_l2}
                            </Text>
                            <Text style={styles.text}>
                                {order.billing_address.city}, {order.billing_address.state}
                            </Text>
                            <Text style={styles.text}>
                                GSTIN/UIN: {order.billing_address.gstin || "—"}
                            </Text>
                        </View>
                    </View>

                    {/* RIGHT COLUMN */}
                    <View style={styles.rightCol}>
                        {[
                            ["Invoice No.", order.invoice_no],
                            ["Dated", new Date(order.created_at).toLocaleDateString()],
                            ["e-Way Bill No.", "—"],
                            ["Motor Vehicle No.", order.vehicle_no || "—"],
                            ["Delivery Note", "—"],
                            ["Mode/Terms of Payment", "—"],
                            ["Buyer's Order No.", "—"],
                            ["Dispatch Doc No.", "—"],
                            ["Terms of Delivery", "—"],
                        ].map(([label, value]) => (
                            <View style={styles.metaRow} key={label}>
                                <Text style={styles.metaCellLabel}>{label}</Text>
                                <Text style={styles.metaCellValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>


                {/* ITEMS TABLE */}
                <View style={[styles.border, { marginTop: 6 }]}>
                    <View style={[styles.row, styles.header]}>
                        {["#", "Description", "HSN", "Qty", "Rate", "Amount"].map(
                            (h, i) => (
                                <Text key={i} style={[styles.cell, { width: "16%" }]}>
                                    {h}
                                </Text>
                            )
                        )}
                    </View>

                    {order.items.map((i: any, idx: number) => (
                        <View key={idx} style={styles.row}>
                            <Text style={[styles.cell, { width: "16%" }]}>
                                {idx + 1}
                            </Text>
                            <Text style={[styles.cell, { width: "16%" }]}>
                                {i.product_name} {i.variant_name}
                            </Text>
                            <Text style={[styles.cell, { width: "16%" }]}>XXX</Text>
                            <Text style={[styles.cell, { width: "16%" }]}>
                                {i.quantity}
                            </Text>
                            <Text style={[styles.cell, { width: "16%" }]}>
                                ₹{i.price}
                            </Text>
                            <Text style={[styles.cell, { width: "16%" }]}>
                                ₹{i.price * i.quantity}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* TOTALS */}
                <View style={{ marginTop: 6 }}>
                    <Text>Taxable Value: ₹{totalTaxable.toFixed(2)}</Text>
                    <Text>CGST @9%: ₹{cgst.toFixed(2)}</Text>
                    <Text>SGST @9%: ₹{sgst.toFixed(2)}</Text>
                    <Text style={styles.header}>
                        Grand Total: ₹{grandTotal.toFixed(2)}
                    </Text>
                </View>

                {/* FOOTER */}
                <View style={{ marginTop: 6 }}>
                    <Text>
                        Amount (in words): {amountToWords(grandTotal)}
                    </Text>

                    <Text style={{ marginTop: 4 }}>
                        Bank: {COMPANY.bank.bankName} | A/c No:{" "}
                        {COMPANY.bank.accountNumber}
                    </Text>

                    <Text style={{ marginTop: 8 }}>
                        This is a Computer Generated Invoice
                    </Text>
                    <Text>SUBJECT TO FARIDABAD JURISDICTION</Text>
                </View>
            </Page>
        </Document>
    );
}
