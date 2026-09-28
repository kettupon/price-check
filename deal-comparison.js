(function(root) {
    const pricing = typeof module !== 'undefined' && module.exports ? require('./pricing.js') : root.DealHunterPricing;
    const timestamp = value => Number(value?.toMillis?.() || value) || 0;
    function latestOffers(offers) {
        const latest = new Map();
        for (const offer of [...offers].sort((a,b)=>timestamp(b.lastUpdated)-timestamp(a.lastUpdated))) {
            if (offer.deleted || offer.status === 'hidden') continue;
            const key=JSON.stringify([offer.shop || offer.store,offer.canonicalProductId || offer.name,offer.unitQuantity,offer.subUnitMode,offer.subUnitCount,offer.subUnitSize,pricing.normalizeUnit(offer.subUnitSizeType),offer.subUnitEqual,offer.subUnitCategory,offer.unitType,!!offer.isMemberPrice]);
            if (!latest.has(key)) latest.set(key,offer);
        }
        return [...latest.values()].filter(o=>(o.status || 'active')==='active' && Number.isFinite(Number(o.price)) && Number(o.price)>=0);
    }
    function measure(offer) {
        const unit=pricing.unitInfo(offer.subUnitSizeType);
        if (!unit || (offer.subUnitCategory && offer.subUnitCategory !== unit.category)) return null;
        const normalized={...offer,subUnitSizeType:unit.unit,subUnitCategory:unit.category};
        const quote=pricing.quote(normalized,1);
        return quote.measurePerPack>0?{kind:unit.category,factor:unit.factor,base:quote.measurePerPack,offer:normalized}:null;
    }
    function settings(offers) {
        const available=latestOffers(offers);
        const result=[];
        for (const kind of ['volume','weight']) {
            const measures=available.map(measure).filter(m=>m?.kind===kind);
            if (!measures.length) continue;
            const factor=Math.max(...measures.map(m=>m.factor));
            const unit=kind==='volume'?(factor===1000?'L':'ml'):(factor===1000?'kg':'g');
            result.push({key:kind,label:kind==='volume'?'ปริมาตร':'น้ำหนัก',unit,factor,amount:1});
        }
        const countUnits=[...new Set(available.map(o=>o.subUnit || o.unitType || 'ชิ้น'))];
        for(const unit of countUnits) result.push({key:'count:'+unit,label:'จำนวน ('+unit+')',unit,factor:1,amount:1});
        return result;
    }
    function rank(offers, setting, amount, includeShipping=false) {
        const available=latestOffers(offers);
        if (!setting || !Number.isFinite(Number(amount)) || Number(amount)<=0) return {rows:[],unranked:[],excluded:available.length};
        const rows=[];
        const unranked=[];
        for (const offer of available) {
            const measured=measure(offer);
            const isCount=setting.key.startsWith('count:');
            if (isCount ? (offer.subUnit || offer.unitType || 'ชิ้น')!==setting.unit : measured?.kind!==setting.key) {
                unranked.push({offer,store:offer.shop || offer.store || 'ไม่ระบุร้าน',
                    packPrice:pricing.quote(offer,1,includeShipping).total,
                    reason: measured || isCount ? 'หน่วยต่างกัน' : 'ยังไม่ระบุขนาดหรือหน่วยที่ใช้เปรียบเทียบได้'});
                continue;
            }
            const q=pricing.quote(measured?.offer || offer,1,includeShipping);
            const price=isCount ? q.perItem*Number(amount) : q.total/measured.base*Number(amount)*setting.factor;
            const totalQuantity = isCount ? q.itemsPerPack : measured.base;
            const totalUnit = isCount ? setting.unit : measured.kind === 'volume' ? 'ml' : 'g';
            const size = Number(offer.subUnitSize) * (measured?.factor || 1);
            const multiplier = isCount ? 1 : totalQuantity / size;
            const number = value => value.toLocaleString('th-TH', {maximumFractionDigits:3});
            const quantityLabel = !isCount && multiplier > 1
                ? `${number(size)} ${totalUnit} × ${number(multiplier)} = ${number(totalQuantity)} ${totalUnit}`
                : `${number(totalQuantity)} ${totalUnit}`;
            if(Number.isFinite(price)) rows.push({offer,store:offer.shop || offer.store || 'ไม่ระบุร้าน',price,packPrice:q.total,totalQuantity,totalUnit,quantityLabel});
        }
        const excluded=available.length-rows.length;
        // Keep each store's distinct current sizes and variants in the ranking.
        rows.sort((a,b)=>a.price-b.price || timestamp(b.offer.lastUpdated)-timestamp(a.offer.lastUpdated));
        const best=rows[0]?.price;
        return {excluded,unranked,rows:rows.map(row=>({...row,percent:best===0?(row.price===0?0:null):(row.price-best)/best*100}))};
    }
    const api={latestOffers,settings,rank};
    if(typeof module!=='undefined' && module.exports)module.exports=api;else root.DealHunterComparison=api;
})(typeof window!=='undefined'?window:globalThis);
