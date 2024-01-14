export const render_img = (piece : string) => {
    if (piece.startsWith('wr'))
        return (<img src="/assets/wr.png" />);
    else if (piece.startsWith('br'))
        return (<img src="/assets/br.png" />);
    else if (piece.startsWith('wn'))
        return (<img src="/assets/wn.png" />);
    else if (piece.startsWith('bn'))
        return (<img src="/assets/bn.png" />);
    else if (piece.startsWith('wb'))
        return (<img src="/assets/wb.png" />);
    else if (piece.startsWith('bb'))
        return (<img src="/assets/bb.png" />);
    else if (piece.startsWith('wq'))
        return (<img src="/assets/wq.png" />);
    else if (piece.startsWith('bq'))
        return (<img src="/assets/bq.png" />);
    else if (piece.startsWith('wk'))
        return (<img src="/assets/wk.png" />);
    else if (piece.startsWith('bk'))
        return (<img src="/assets/bk.png" />);
    else if (piece.startsWith('wp'))
        return (<img src="/assets/wp.png" />);
    else if (piece.startsWith('bp'))
        return (<img src="/assets/bp.png" />);
}