const form = document.getElementById("form")

form.addEventListener('submit', function(event){
    event.preventDefault();

    const type = document.getElementById('type').value;
    const value = Number(document.getElementById('value').value);
    const interest = Number(document.getElementById('interest').value);
    const installments = Number(document.getElementById('installments').value);
    const downPayment = Number(document.getElementById('down_payment').value) || 0;

    const financed = value - downPayment;
    const rate = interest / 100;

    const parcela = financed * (rate * Math.pow((1 + rate), installments)) / (Math.pow((1 + rate), installments) - 1);
    const total = parcela * installments;
    const totalInterest = total - financed;
    const increase = ((total - financed) / value) * 100;

    let message = '';
    if(increase <= 30){
        message = `🟢 Muito bom, vale apenas investir nesse(a) ${type}`;
    } else if(increase <= 50) {
        message = `🟡 Investimento aceitável, é de se considerar esse(a) ${type}`;
    } else {
        message = `🔴 Mal Negócio, não vale a pena investir nesse(a) ${type}`;
    }

    document.getElementById('final').innerHTML = `
        Valor original: ${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} <br><br>
        Parcela mensal: ${parcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} <br><br>
        Valor final: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} <br><br>
        Total de juros: ${totalInterest.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} <br><br>
        Aumento: ${increase.toFixed(2)}% <br><br>
        ${message}
    `;

    document.getElementById('btnPlanilha').style.display = 'block';

    // Salva no banco
    fetch('/salvar_calculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo_bem: type,
            valor_bem: value,
            taxa_juros: interest,
            parcelas: installments,
            entrada: downPayment,
            parcela_mensal: parcela,
            valor_final: total,
            total_juros: totalInterest,
            aumento: increase,
            vale_a_pena: increase <= 30 ? 'bom' : increase <= 50 ? 'aceitavel' : 'ruim'
        })
    });
});

function baixarPlanilha() {
    const type = document.getElementById('type').value;
    const value = Number(document.getElementById('value').value);
    const interest = Number(document.getElementById('interest').value);
    const installments = Number(document.getElementById('installments').value);
    const downPayment = Number(document.getElementById('down_payment').value) || 0;

    fetch('/gerar_planilha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo_bem: type,
            valor_bem: value,
            taxa_juros: interest,
            parcelas: installments,
            entrada: downPayment
        })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cognivest_${type}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

function limparCalculadora() {
    document.getElementById('form').reset();
    document.getElementById('final').innerHTML = '';
    document.getElementById('btnPlanilha').style.display = 'none';
}