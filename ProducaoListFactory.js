import ProducaoListController from "@/controllers/bps/producao/ProducaoListController";
import GetAreasProducao from "@/useCases/bps/producao/GET/GetAreasProducao";
import GetDemandaArea from "@/useCases/bps/producao/GET/GetDemandaArea";
import GetL2LStatus from "@/useCases/bps/producao/GET/GetL2LStatus";
import GetMD47 from "@/useCases/bps/producao/GET/GetMD47";
import { GetSQCDAnual } from "@/useCases/bps/producao/GET/GetSqdcAnual";
import { GetHse } from "@/useCases/bps/producao/GET/GetHse";



export default function ProducaoListFactory(conn) {
    return new ProducaoListController({
        consultarHoraHora: new GetL2LStatus(conn),
        consultarMD47: new GetMD47(conn),
        consultarDemandasArea: new GetDemandaArea(conn),
        consultarAreasProducao: new GetAreasProducao(conn),
        consultarSQDCAnual: new GetSQCDAnual(conn),
        consultarHSE: new GetHse(conn ),
    })
}
