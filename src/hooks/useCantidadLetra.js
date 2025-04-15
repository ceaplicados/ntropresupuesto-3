const useCantidadLetra = () => {
    const numeros_base = (num) => {
        let num_letra='';
        let num_comp=Math.floor(num/100)-Math.floor(num/1000)*10;
        switch(num_comp){
            case 1:
            if(num-Math.floor(num/1000)==100){
                num_letra+= 'cien';
                break;
            }else{
                num_letra+= 'ciento ';
                break;
            }
            case 2:
            num_letra+= 'doscientos ';
            break;
            case 3:
            num_letra+= 'trescientos ';
            break;
            case 4:
            num_letra+= 'cuatrocientos ';
            break;
            case 5:
            num_letra+= 'quinientos ';
            break;
            case 6:
            num_letra+= 'seiscientos ';
            break;
            case 7:
            num_letra+= 'setecientos ';
            break;
            case 8:
            num_letra+= 'ochocientos ';
            break;
            case 9:
            num_letra+= 'novecientos ';
            break;
        }
        num_comp=Math.floor(num/10)-Math.floor(num/100)*10;
        if(num_comp!==1){
            if(num-Math.floor(num/10)*10==0){
                switch(num_comp){
                case 1:
                num_letra+= 'diez';
                break;
                case 2:
                num_letra+= 'veinte';
                break;
                case 3:
                num_letra+= 'treinta';
                break;
                case 4:
                num_letra+= 'cuarenta';
                break;
                case 5:
                num_letra+= 'cincuenta';
                break;
                case 6:
                num_letra+= 'sesenta';
                break;
                case 7:
                num_letra+= 'setenta';
                break;
                case 8:
                num_letra+= 'ochenta';
                break;
                case 9:
                num_letra+= 'noventa';
                break;
                }
            }else{
                switch(num_comp){
                case 2:
                num_letra+= 'venti';
                break;
                case 3:
                num_letra+= 'treinta y ';
                break;
                case 4:
                num_letra+= 'cuarenta y ';
                break;
                case 5:
                num_letra+= 'cincuenta y ';
                break;
                case 6:
                num_letra+= 'sesenta y ';
                break;
                case 7:
                num_letra+= 'setenta y ';
                break;
                case 8:
                num_letra+= 'ochenta y ';
                break;
                case 9:
                num_letra+= 'noventa y ';
                break;
                }
                num_comp=num-Math.floor(num/10)*10;
                switch(num_comp){
                case 1:
                num_letra+= 'uno';
                break;
                case 2:
                num_letra+= 'dos';
                break;
                case 3:
                num_letra+= 'tres';
                break;
                case 4:
                num_letra+= 'cuatro';
                break;
                case 5:
                num_letra+= 'cinco';
                break;
                case 6:
                num_letra+= 'seis';
                break;
                case 7:
                num_letra+= 'siete';
                break;
                case 8:
                num_letra+= 'ocho';
                break;
                case 9:
                num_letra+= 'nueve';
                break;
                case 0:
                num_letra+= 'diez';
                break;
                }
            }
        }else{
        num_comp=num-Math.floor(num/100)*100;
        switch(num_comp){
            case 10:
            num_letra+= 'diez';
            break;
            case 11:
            num_letra+= 'once';
            break;
            case 12:
            num_letra+= 'doce';
            break;
            case 13:
            num_letra+= 'trece';
            break;
            case 14:
            num_letra+= 'catorce';
            break;
            case 15:
            num_letra+= 'quince';
            break;
            case 16:
            num_letra+= 'dieciseis';
            break;
            case 17:
            num_letra+= 'diecisiete';
            break;
            case 18:
            num_letra+= 'dieciocho';
            break;
            case 19:
            num_letra+= 'deicinueve';
            break;
        }
        }
        return num_letra;
    }
    
    const cantidadLetra = (cant) => {
        let cant_letra='';
        let centavos=cant-Math.floor(cant) || 0;
        centavos=centavos*100;
        centavos=Math.round(centavos,0)+'' || '0';
        if(centavos.length<2){
            centavos='0'+centavos;
        }
        cant=Math.floor(cant);  
        // billones
        if(Math.floor(cant/1000000000000)-Math.floor(cant/1000000000000000)*1000>0){
            if(numeros_base(Math.floor(cant/1000000000000))=='uno'){
                cant_letra+='Un billón ';
            }else{
                cant_letra+=numeros_base(Math.floor(cant/1000000000000))+' billones ';
            }
        }
        // miles de millones
        if(Math.floor(cant/1000000000)-Math.floor(cant/1000000000000)*1000>0){
            if(numeros_base(Math.floor(cant/1000000000))=='uno'){
                cant_letra+='Un mil ';
            }else{
                cant_letra+=numeros_base(Math.floor(cant/1000000000))+' mil ';
            }
        }
        // millones
        if(Math.floor(cant/1000000)-Math.floor(cant/1000000000)*1000>0){
            if(numeros_base(Math.floor(cant/1000000))=='uno'){
                cant_letra+='Un millón ';
            }else{
                cant_letra+=numeros_base(Math.floor(cant/1000000))+' millones ';
            }
        }
        // miles
        if(Math.floor(cant/1000)-Math.floor(cant/1000000)*1000>0){
            if(numeros_base(Math.floor(cant/1000))=='uno'){
                cant_letra+='Un mil ';
            }else{
                cant_letra+=numeros_base(Math.floor(cant/1000))+' mil ';
            }
        }
        cant_letra+=numeros_base(cant);
        return cant_letra+' pesos '+centavos+'/100';
    }

    return cantidadLetra;
}

export default useCantidadLetra;