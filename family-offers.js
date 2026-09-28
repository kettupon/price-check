(function(root) {
    const node = typeof module !== 'undefined' && module.exports;
    const pricing = node ? require('./pricing.js') : root.DealHunterPricing;
    const comparison = node ? require('./deal-comparison.js') : root.DealHunterComparison;
    const money = n => n.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2});
    function summarize(offers, includeShipping = false) {
        const rows = comparison.latestOffers(offers).map(offer => {
            // Cashback is a later benefit, not money deducted at checkout.
            const q = pricing.quote({...offer, cashbackUsed:false}, 1, includeShipping);
            const fee = offer.recordedShippingFee !== undefined ? offer.recordedShippingFee : offer.shippingFee;
            const type = offer.recordedShippingType !== undefined ? offer.recordedShippingType : offer.shippingType;
            const known = type === 'included' || (type === 'excluded' && fee !== null && fee !== '' && fee !== undefined && Number.isFinite(Number(fee)) && Number(fee) >= 0);
            const conditions = [type === 'included' ? 'ส่งฟรี / รวมค่าส่งแล้ว' : known ? `ค่าส่ง +฿${money(Number(fee))}${includeShipping ? ' (รวมแล้ว)' : ' (ยังไม่รวม)'}` : 'ยังไม่ทราบค่าส่ง'];
            if (offer.isMemberPrice) conditions.push('ราคาสมาชิก');
            if (offer.promoCodeUsed) conditions.push(`ต้องใช้โค้ด ${offer.promoCode || '(ไม่ระบุ)'}`);
            if (offer.cashbackUsed) conditions.push(`แคชแบ็ก ฿${money(Number(offer.cashbackAmount) || 0)} ภายหลัง — ยังไม่หัก`);
            if (offer.priceTiers?.some(t => Number(t.minQuantity) > 1)) conditions.push('มีราคาซื้อหลายแพ็ก — ใช้ราคา 1 แพ็ก');
            const info = pricing.unitInfo(offer.subUnitSizeType);
            const multiplier = q.measurePerPack ? q.measurePerPack / (Number(offer.subUnitSize) * info.factor) : 1;
            const size = q.measurePerPack ? `${offer.subUnitSize} ${info.unit}${multiplier > 1 ? ` × ${multiplier}` : ''} / แพ็ก${multiplier > 1 ? ` (รวม ${q.measurePerPack.toLocaleString('th-TH')} ${info.category === 'weight' ? 'g' : 'ml'})` : ''}` : `${q.itemsPerPack} ${offer.subUnit || offer.unitType || 'ชิ้น'} / แพ็ก · ไม่ทราบขนาด`;
            return {offer, total:q.total, unitPrice:q.per100, kind:q.measurePerPack ? info.category : null, size, conditions,
                eligible:!includeShipping || known, conditional:!!(offer.isMemberPrice || offer.promoCodeUsed)};
        });
        const eligible = rows.filter(r => r.eligible);
        const ordinary = eligible.filter(r => !r.conditional);
        const pool = ordinary.length ? ordinary : eligible;
        const lowest = [...pool].sort((a,b) => a.total-b.total)[0];
        const kinds = new Set(pool.map(r => r.kind).filter(Boolean));
        const best = kinds.size === 1 ? [...pool].filter(r => r.unitPrice !== null).sort((a,b) => a.unitPrice-b.unitPrice)[0] : null;
        const highlights = [...new Set([lowest,best].filter(Boolean))].map(row => ({...row, badges:[...(row===lowest?['Lowest price']:[]),...(row===best?['Best value']:[])]}));
        return {rows, highlights, note: `${includeShipping ? 'รวมค่าส่งที่ทราบ · รายการไม่ทราบค่าส่งไม่จัดอันดับ' : 'เปรียบเทียบก่อนค่าส่ง'} · ซื้อ 1 แพ็ก · ไม่หักแคชแบ็ก${ordinary.length ? ' · จัดอันดับราคาที่ไม่ต้องเป็นสมาชิกหรือใช้โค้ด' : pool.length ? ' · ผู้ชนะมีเงื่อนไขตามที่ระบุ' : ''}${!best ? ' · ยังเปรียบเทียบความคุ้มค่าข้ามขนาดไม่ได้ (ขนาดไม่ครบหรือหน่วยต่างกัน)' : ' · Best value เทียบเฉพาะรายการที่ระบุขนาดได้'}`};
    }
    const api={summarize};
    if(node) module.exports=api; else root.DealHunterFamilyOffers=api;
})(typeof window !== 'undefined' ? window : globalThis);
