import QtQuick 2.15
import QtQuick.Layouts 1.15
import org.kde.plasma.plasmoid 2.0
import org.kde.plasma.core 2.0 as PlasmaCore
import QtWebEngine 1.10

Item {
    id: root

    // Sem o fundo padrão do Plasma: só o "ovo" aparece na área de trabalho
    Plasmoid.backgroundHints: PlasmaCore.Types.NoBackground
    // No painel vira um ícone que abre o jogo num popup
    Plasmoid.switchWidth: 200
    Plasmoid.switchHeight: 250
    Plasmoid.icon: "applications-games"
    Plasmoid.toolTipMainText: "Tamadragão"
    Plasmoid.toolTipSubText: "Cuide do seu dragãozinho"

    // Perfil próprio e persistente: o progresso fica salvo entre reinícios
    WebEngineProfile {
        id: tamaProfile
        storageName: "tamagato"
        offTheRecord: false
        httpCacheType: WebEngineProfile.DiskHttpCache
        persistentCookiesPolicy: WebEngineProfile.ForcePersistentCookies
    }

    Plasmoid.fullRepresentation: Item {
        Layout.preferredWidth: 360
        Layout.preferredHeight: 500
        Layout.minimumWidth: 200
        Layout.minimumHeight: 250

        WebEngineView {
            id: view
            anchors.fill: parent
            profile: tamaProfile
            backgroundColor: "transparent"
            url: Qt.resolvedUrl("../html/tamagato.html") + "?widget=1"
            settings.localContentCanAccessRemoteUrls: true
            settings.localStorageEnabled: true
            settings.playbackRequiresUserGesture: false
            settings.showScrollBars: false

            // Links externos (se houver) abrem no navegador do sistema
            onNewViewRequested: function(request) {
                Qt.openUrlExternally(request.requestedUrl)
            }
        }
    }
}
