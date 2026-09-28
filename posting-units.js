(function(root){
 const pricing=typeof module!=='undefined'&&module.exports?require('./pricing.js'):root.DealHunterPricing;
 function validate(v){
  const fail=error=>({error,warning:''});
  const positive=n=>Number.isFinite(Number(n))&&Number(n)>0;
  if(!v.subUnit?.trim())return fail('กรุณาระบุหน่วย เช่น ขวด ถุง หรือชิ้น');
  if(!Number.isInteger(Number(v.unit))||Number(v.unit)<1)return fail('จำนวนที่ซื้อ ต้องเป็นจำนวนเต็มมากกว่า 0');
  if(!['one','many'].includes(v.subUnitMode))return fail('กรุณายืนยันจำนวนและขนาด หรือเลือกขายเป็นชิ้น');
  if(v.subUnitMode==='many'&&(!Number.isInteger(Number(v.subUnitCount))||Number(v.subUnitCount)<2||Number(v.subUnitCount)>100))return fail('จำนวนในแพ็กต้องเป็นจำนวนเต็ม 2–100');
  if(!v.subUnitCategory)return fail('กรุณาเลือกปริมาตร น้ำหนัก หรือไม่ระบุขนาด');
  if(v.subUnitCategory==='none')return {error:'',warning:''};
  if(v.subUnitMode==='many'&&typeof v.subUnitEqual!=='boolean')return fail('กรุณาระบุว่าแต่ละชิ้นมีขนาดเท่ากันหรือไม่');
  const info=pricing.unitInfo(v.subUnitSizeType);
  if(['volume','weight'].includes(v.subUnitCategory)&&info?.category!==v.subUnitCategory)return fail('หน่วยไม่ตรงกับประเภท: ปริมาตรใช้ ml/L น้ำหนักใช้ g/kg');
  if(!v.subUnitSizeType?.trim())return fail('กรุณาระบุหน่วยของขนาด');
  const mixed=v.subUnitMode==='many'&&v.subUnitEqual===false;
  const sizes=mixed?(v.subUnitSizes||[]).map(s=>s.size):[v.subUnitSize];
  if(mixed&&sizes.length!==Number(v.subUnitCount))return fail('กรุณาระบุขนาดให้ครบทุกชิ้น');
  if(sizes.some(n=>!positive(n)))return fail('ขนาดทุกช่องต้องเป็นตัวเลขมากกว่า 0');
  return {error:'',warning:info?.factor===1000&&sizes.some(n=>Number(n)>=100)?`ขนาด ${sizes.join(', ')} ${info.unit} ต่อชิ้นสูงมาก ตรวจสอบว่าต้องการใช้ ${info.category==='volume'?'ml':'g'} แทนหรือไม่ ยืนยันหน่วยนี้?`:''};
 }
 const api={validate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DealHunterPostingUnits=api;
})(typeof window!=='undefined'?window:globalThis);
